import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAdminApi } from "@/lib/admin/guard";
import { slugify } from "@/lib/utils";
import {
  parseBdroppyWorkbook,
  summarizeGroups,
  toCandidateProduct,
  translateCategory,
  type CandidateProduct,
} from "@/lib/admin/catalogue-import";

export const maxDuration = 60;

const CHUNK_SIZE = 300;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const mode = formData.get("mode");
  const fxRate = Number(formData.get("fxRate"));
  const marginPercent = Number(formData.get("marginPercent"));

  if (!file) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (mode !== "preview" && mode !== "commit") {
    return NextResponse.json({ error: "invalid_mode" }, { status: 400 });
  }
  if (!Number.isFinite(fxRate) || fxRate <= 0 || !Number.isFinite(marginPercent)) {
    return NextResponse.json({ error: "invalid_price_options" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let groups;
  try {
    groups = parseBdroppyWorkbook(buffer);
  } catch {
    return NextResponse.json({ error: "invalid_file" }, { status: 400 });
  }

  if (mode === "preview") {
    return NextResponse.json(summarizeGroups(groups));
  }

  // mode === "commit"
  let selectedCategories: string[];
  try {
    selectedCategories = JSON.parse(String(formData.get("categories") ?? "[]"));
  } catch {
    selectedCategories = [];
  }
  if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
    return NextResponse.json({ error: "no_categories_selected" }, { status: 400 });
  }
  const categorySet = new Set(selectedCategories);

  const filtered = groups.filter((g) => categorySet.has(g.categoryFr));
  const skipped: { code: string; reason: string }[] = [];
  const valid = filtered.filter((g) => {
    if (!g.brand || !g.code) {
      skipped.push({ code: g.code || `product_${g.productId}`, reason: "missing_data" });
      return false;
    }
    if (g.sellPriceEur <= 0) {
      skipped.push({ code: g.code, reason: "invalid_price" });
      return false;
    }
    return true;
  });

  const supabase = await createClient();

  // 1. Catégories/sous-catégories manquantes -------------------------------
  const { data: existingCategoriesRaw, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name_fr, parent_id");
  if (categoriesError) {
    return NextResponse.json({ error: "categories_read_failed" }, { status: 500 });
  }
  const existingCategories = existingCategoriesRaw ?? [];

  const topLevelIdByName = new Map<string, string>();
  const subcategoryIdByKey = new Map<string, string>(); // `${categoryFr}::${subcategoryFr}` -> id
  for (const cat of existingCategories) {
    if (cat.parent_id === null) {
      topLevelIdByName.set(cat.name_fr, cat.id);
    }
  }
  for (const cat of existingCategories) {
    if (cat.parent_id !== null) {
      const parent = existingCategories.find((c) => c.id === cat.parent_id);
      if (parent) subcategoryIdByKey.set(`${parent.name_fr}::${cat.name_fr}`, cat.id);
    }
  }

  const neededPairs = new Map<string, { categoryFr: string; subcategoryFr: string }>();
  for (const g of valid) {
    neededPairs.set(`${g.categoryFr}::${g.subcategoryFr}`, {
      categoryFr: g.categoryFr,
      subcategoryFr: g.subcategoryFr,
    });
  }

  let categoriesCreated = 0;

  for (const { categoryFr } of neededPairs.values()) {
    if (topLevelIdByName.has(categoryFr)) continue;
    const { data, error } = await supabase
      .from("categories")
      .insert({
        slug: slugify(categoryFr),
        name_fr: categoryFr,
        name_en: translateCategory(categoryFr),
        parent_id: null,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "category_create_failed" }, { status: 500 });
    topLevelIdByName.set(categoryFr, data.id);
    categoriesCreated += 1;
  }

  for (const { categoryFr, subcategoryFr } of neededPairs.values()) {
    const key = `${categoryFr}::${subcategoryFr}`;
    if (subcategoryIdByKey.has(key)) continue;
    const parentId = topLevelIdByName.get(categoryFr)!;
    const { data, error } = await supabase
      .from("categories")
      .insert({
        slug: slugify(`${categoryFr}-${subcategoryFr}`),
        name_fr: subcategoryFr,
        name_en: translateCategory(subcategoryFr),
        parent_id: parentId,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "category_create_failed" }, { status: 500 });
    subcategoryIdByKey.set(key, data.id);
    categoriesCreated += 1;
  }

  // 2. Produits candidats, slugs uniques sur tout le lot + l'existant ------
  const { data: existingSlugRows, error: slugsError } = await supabase
    .from("products")
    .select("slug");
  if (slugsError) return NextResponse.json({ error: "products_read_failed" }, { status: 500 });
  const usedSlugs = new Set((existingSlugRows ?? []).map((r) => r.slug));

  const candidates: CandidateProduct[] = valid.map((g) =>
    toCandidateProduct(g, { fxRate, marginPercent }, usedSlugs),
  );

  // 3. Insertion en lots -----------------------------------------------------
  let productsCreated = 0;
  let sizesCreated = 0;
  let imagesCreated = 0;

  for (const batch of chunk(candidates, CHUNK_SIZE)) {
    const { error: insertError } = await supabase.from("products").insert(
      batch.map((c) => ({
        slug: c.slug,
        name_fr: c.nameFr,
        name_en: c.nameEn,
        description_fr: c.descriptionFr,
        description_en: c.descriptionEn,
        price: c.price,
        promo_price: null,
        category_id: subcategoryIdByKey.get(`${c.categoryFr}::${c.subcategoryFr}`) ?? null,
        stock: c.stock,
        status: "draft",
        featured: false,
      })),
    );
    if (insertError) {
      for (const c of batch) skipped.push({ code: c.slug, reason: "insert_failed" });
      continue;
    }

    const { data: insertedRows, error: readBackError } = await supabase
      .from("products")
      .select("id, slug")
      .in(
        "slug",
        batch.map((c) => c.slug),
      );
    if (readBackError || !insertedRows) {
      for (const c of batch) skipped.push({ code: c.slug, reason: "read_back_failed" });
      continue;
    }
    const idBySlug = new Map(insertedRows.map((r) => [r.slug, r.id]));
    productsCreated += insertedRows.length;

    const sizeRows = batch.flatMap((c) => {
      const productId = idBySlug.get(c.slug);
      if (!productId) return [];
      return c.sizes.map((size, index) => ({
        product_id: productId,
        label: size.label,
        stock: size.stock,
        display_order: index,
      }));
    });
    if (sizeRows.length > 0) {
      const { error: sizesError } = await supabase.from("product_sizes").insert(sizeRows);
      if (!sizesError) sizesCreated += sizeRows.length;
    }

    const imageRows = batch.flatMap((c) => {
      const productId = idBySlug.get(c.slug);
      if (!productId) return [];
      return c.images.map((url, index) => ({
        product_id: productId,
        url,
        display_order: index,
      }));
    });
    if (imageRows.length > 0) {
      const { error: imagesError } = await supabase.from("product_images").insert(imageRows);
      if (!imagesError) imagesCreated += imageRows.length;
    }
  }

  return NextResponse.json({
    productsCreated,
    categoriesCreated,
    sizesCreated,
    imagesCreated,
    skipped,
  });
}
