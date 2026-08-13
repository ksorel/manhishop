import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import {
  convertPrice,
  parseBdroppyWorkbook,
  stripHtml,
  summarizeGroups,
  toCandidateProduct,
  type RawProductGroup,
} from "@/lib/admin/catalogue-import";

const HEADER = [
  "record_type",
  "product_id",
  "model_id",
  "brand",
  "name",
  "code",
  "product_quantity",
  "cost_no_tax",
  "street_price",
  "suggested_price",
  "sell_price",
  "plain_description",
  "weight",
  "picture",
  "picture 1",
  "picture 2",
  "picture 3",
  "madein",
  "Firme",
  "heel",
  "Produzione",
  "Categorie",
  "Sottocategorie",
  "season",
  "color",
  "service",
  "Warehouse2",
  "Sunglasses",
  "Watches",
  "bicolors",
  "Genere",
  "Print",
  "productname",
  "barcode",
  "model_size",
  "model_quantity",
];

function productRow(overrides: Record<string, unknown> = {}): unknown[] {
  const base: Record<string, unknown> = {
    record_type: "PRODUCT",
    product_id: 1,
    brand: "Versace",
    code: "VEPX012-21_RED",
    sell_price: 462,
    plain_description: "<div class='pdbDescSection'><span>Genre:</span><span>Femme</span></div>",
    "picture 1": "https://media.bdroppy.com/a.jpg",
    "picture 2": "",
    "picture 3": "",
    Categorie: "Accessoires",
    Sottocategorie: "Montres",
    ...overrides,
  };
  return HEADER.map((key) => base[key] ?? "");
}

function modelRow(overrides: Record<string, unknown> = {}): unknown[] {
  const base: Record<string, unknown> = {
    record_type: "MODEL",
    product_id: 1,
    model_size: "NOSIZE",
    model_quantity: 1,
    ...overrides,
  };
  return HEADER.map((key) => base[key] ?? "");
}

function buildWorkbookBuffer(rows: unknown[][]): Buffer {
  const sheet = XLSX.utils.aoa_to_sheet([HEADER, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet 1");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

describe("stripHtml", () => {
  it("removes tags and collapses whitespace into lines", () => {
    const html =
      "<div class='pdbDescSection'><span>Genre:</span><span>Femme</span></div><div>Autre</div>";
    expect(stripHtml(html)).toBe("Genre: Femme\nAutre");
  });
});

describe("convertPrice", () => {
  it("applies the FX rate and margin, rounded to the nearest 5", () => {
    expect(convertPrice(100, { fxRate: 655.957, marginPercent: 0 })).toBe(65595);
    expect(convertPrice(100, { fxRate: 655.957, marginPercent: 20 })).toBe(78715);
  });
});

describe("parseBdroppyWorkbook", () => {
  it("groups each PRODUCT row with the MODEL rows that follow it", () => {
    const buffer = buildWorkbookBuffer([
      productRow({ product_id: 1, code: "AAA" }),
      modelRow({ product_id: 1, model_size: "S", model_quantity: 3 }),
      modelRow({ product_id: 1, model_size: "M", model_quantity: 5 }),
      productRow({ product_id: 2, code: "BBB" }),
      modelRow({ product_id: 2, model_size: "NOSIZE", model_quantity: 10 }),
    ]);

    const groups = parseBdroppyWorkbook(buffer);

    expect(groups).toHaveLength(2);
    expect(groups[0].code).toBe("AAA");
    expect(groups[0].models).toEqual([
      { size: "S", quantity: 3 },
      { size: "M", quantity: 5 },
    ]);
    expect(groups[1].code).toBe("BBB");
    expect(groups[1].models).toEqual([{ size: "NOSIZE", quantity: 10 }]);
  });

  it("deduplicates and drops blank picture URLs", () => {
    const buffer = buildWorkbookBuffer([
      productRow({
        "picture 1": "https://media.bdroppy.com/a.jpg",
        "picture 2": "https://media.bdroppy.com/a.jpg",
        "picture 3": "",
      }),
      modelRow(),
    ]);

    const groups = parseBdroppyWorkbook(buffer);
    expect(groups[0].images).toEqual(["https://media.bdroppy.com/a.jpg"]);
  });
});

function group(overrides: Partial<RawProductGroup> = {}): RawProductGroup {
  return {
    productId: 1,
    brand: "Versace",
    code: "VEPX012-21_RED",
    sellPriceEur: 100,
    descriptionHtml: "<div>Desc</div>",
    images: ["https://media.bdroppy.com/a.jpg"],
    categoryFr: "Accessoires",
    subcategoryFr: "Montres",
    models: [{ size: "NOSIZE", quantity: 4 }],
    ...overrides,
  };
}

describe("toCandidateProduct", () => {
  const priceOptions = { fxRate: 655.957, marginPercent: 0 };

  it("names the product from brand + subcategory, translated to English", () => {
    const candidate = toCandidateProduct(group(), priceOptions, new Set());
    expect(candidate.nameFr).toBe("Versace Montres");
    expect(candidate.nameEn).toBe("Versace Watches");
  });

  it("treats a single NOSIZE model as a simple product with top-level stock", () => {
    const candidate = toCandidateProduct(group(), priceOptions, new Set());
    expect(candidate.sizes).toEqual([]);
    expect(candidate.stock).toBe(4);
  });

  it("builds a per-size stock list when real sizes are present", () => {
    const candidate = toCandidateProduct(
      group({ models: [{ size: "S", quantity: 3 }, { size: "M", quantity: 5 }] }),
      priceOptions,
      new Set(),
    );
    expect(candidate.sizes).toEqual([
      { label: "S", stock: 3 },
      { label: "M", stock: 5 },
    ]);
    expect(candidate.stock).toBe(8);
  });

  it("de-duplicates slugs across a batch using the shared set", () => {
    const usedSlugs = new Set<string>();
    const first = toCandidateProduct(group(), priceOptions, usedSlugs);
    const second = toCandidateProduct(group(), priceOptions, usedSlugs);

    expect(first.slug).not.toBe(second.slug);
    expect(second.slug).toBe(`${first.slug}-2`);
  });

  it("respects slugs already reserved by the caller (e.g. existing products in DB)", () => {
    const candidate = toCandidateProduct(group(), priceOptions, new Set(["versace-vepx012-21-red"]));
    expect(candidate.slug).toBe("versace-vepx012-21-red-2");
  });
});

describe("summarizeGroups", () => {
  it("counts products per category/subcategory and brand, and tracks the EUR price range", () => {
    const groups = [
      group({ brand: "Versace", categoryFr: "Accessoires", subcategoryFr: "Montres", sellPriceEur: 100 }),
      group({ brand: "Versace", categoryFr: "Accessoires", subcategoryFr: "Montres", sellPriceEur: 200 }),
      group({ brand: "Guess", categoryFr: "Sacs", subcategoryFr: "Sacs à main", sellPriceEur: 50 }),
    ];

    const preview = summarizeGroups(groups);

    expect(preview.totalProducts).toBe(3);
    expect(preview.priceRangeEur).toEqual([50, 200]);
    expect(preview.brands).toEqual([
      { name: "Versace", count: 2 },
      { name: "Guess", count: 1 },
    ]);
    expect(preview.categories).toEqual([
      {
        nameFr: "Accessoires",
        nameEn: "Accessories",
        count: 2,
        subcategories: [{ nameFr: "Montres", nameEn: "Watches", count: 2 }],
      },
      {
        nameFr: "Sacs",
        nameEn: "Bags",
        count: 1,
        subcategories: [{ nameFr: "Sacs à main", nameEn: "Handbags", count: 1 }],
      },
    ]);
  });
});
