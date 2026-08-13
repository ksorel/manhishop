import * as XLSX from "xlsx";
import { slugify } from "@/lib/utils";

// Colonnes de l'export fournisseur bdroppy.com : une ligne "PRODUCT" suivie
// d'une ou plusieurs lignes "MODEL" (une par variante taille/quantité),
// jusqu'à la prochaine ligne "PRODUCT".
const COLUMNS = [
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
] as const;

export interface RawProductGroup {
  productId: number;
  brand: string;
  code: string;
  sellPriceEur: number;
  descriptionHtml: string;
  images: string[];
  categoryFr: string;
  subcategoryFr: string;
  models: { size: string; quantity: number }[];
}

/** Retire les balises du gabarit de description bdroppy (`pdbDescContainer`)
 * et aplati le HTML en texte lisible. */

// Entités HTML nommées les plus courantes dans les descriptions fournisseur
// (accents français, ponctuation) ; les entités numériques (&#39;, &#x27;...)
// sont décodées séparément, sans avoir besoin d'être listées ici.
const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  eacute: "é",
  Eacute: "É",
  egrave: "è",
  Egrave: "È",
  ecirc: "ê",
  euml: "ë",
  agrave: "à",
  Agrave: "À",
  acirc: "â",
  auml: "ä",
  ocirc: "ô",
  ouml: "ö",
  ugrave: "ù",
  ucirc: "û",
  uuml: "ü",
  icirc: "î",
  iuml: "ï",
  ccedil: "ç",
  Ccedil: "Ç",
  oelig: "œ",
  aelig: "æ",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  hellip: "…",
  mdash: "—",
  ndash: "–",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity[0] === "#") {
      const isHex = entity[1] === "x" || entity[1] === "X";
      const code = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

export function stripHtml(html: string): string {
  return decodeEntities(html)
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function parseBdroppyWorkbook(buffer: Buffer | ArrayBuffer): RawProductGroup[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", blankrows: false });

  const header = rows[0] as string[];
  for (const name of COLUMNS) {
    if (!header.includes(name)) {
      throw new Error(`unexpected file format: missing column "${name}"`);
    }
  }
  const idx = (name: (typeof COLUMNS)[number]) => header.indexOf(name);
  const col = {
    recordType: idx("record_type"),
    productId: idx("product_id"),
    brand: idx("brand"),
    code: idx("code"),
    sellPrice: idx("sell_price"),
    description: idx("plain_description"),
    picture1: idx("picture 1"),
    picture2: idx("picture 2"),
    picture3: idx("picture 3"),
    categorie: idx("Categorie"),
    sottocategorie: idx("Sottocategorie"),
    modelSize: idx("model_size"),
    modelQuantity: idx("model_quantity"),
  };

  const groups: RawProductGroup[] = [];
  let current: RawProductGroup | null = null;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const recordType = row[col.recordType];

    if (recordType === "PRODUCT") {
      current = {
        productId: Number(row[col.productId]),
        brand: String(row[col.brand] ?? "").trim(),
        code: String(row[col.code] ?? "").trim(),
        sellPriceEur: Number(row[col.sellPrice]) || 0,
        descriptionHtml: String(row[col.description] ?? ""),
        images: [row[col.picture1], row[col.picture2], row[col.picture3]]
          .map((url) => String(url ?? "").trim())
          .filter((url, index, all) => url !== "" && all.indexOf(url) === index),
        categoryFr: String(row[col.categorie] ?? "").trim(),
        subcategoryFr: String(row[col.sottocategorie] ?? "").trim(),
        models: [],
      };
      groups.push(current);
    } else if (recordType === "MODEL" && current) {
      current.models.push({
        size: String(row[col.modelSize] ?? "").trim(),
        quantity: Number(row[col.modelQuantity]) || 0,
      });
    }
  }

  return groups;
}

// Table de correspondance FR -> EN pour les catégories/sous-catégories du
// fichier bdroppy : ~50 mots fixes, traduisibles à la main une fois pour
// toutes sans dépendre d'un service de traduction payant. Les descriptions
// produit, elles, restent en français (voir toCandidateProduct).
export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  Accessoires: "Accessories",
  Sacs: "Bags",
  Vêtements: "Clothing",
  "Sous-vêtements": "Underwear",
  Chaussures: "Shoes",
  Beauté: "Beauty",

  Montres: "Watches",
  Portefeuilles: "Wallets",
  Serviettes: "Document bags",
  Echarpes: "Scarves",
  Ceintures: "Belts",
  "Porte-clefs": "Keychains",
  "Lunettes de soleil": "Sunglasses",
  Lunettes: "Glasses",
  Colliers: "Necklaces",
  Pendentifs: "Pendants",
  "Gift box": "Gift box",
  "Etiquettes de bagages": "Luggage tags",

  "Sacs bandoulière": "Crossbody bags",
  "Sacs à dos": "Backpacks",
  "Sacs porté épaule": "Shoulder bags",
  "Sacs à main": "Handbags",
  Cabas: "Tote bags",
  Pochettes: "Clutches",
  Mallettes: "Briefcases",
  "Sacs de voyage": "Travel bags",
  "Sac banane": "Waist bags",

  "T-shirts": "T-shirts",
  Polo: "Polo shirts",
  "Sweat-shirts": "Sweatshirts",
  Vestes: "Jackets",
  Manteaux: "Coats",
  "Maillots de bains": "Swimwear",
  Pantalons: "Trousers",
  "Pantalon de jogging": "Jogging pants",
  Top: "Top",
  Pulls: "Sweaters",
  Jeans: "Jeans",
  Robes: "Dresses",
  Jupes: "Skirts",
  Body: "Bodysuits",
  Leggings: "Leggings",
  Chemises: "Shirts",
  "Trench coat": "Trench coat",
  Bermuda: "Bermuda shorts",
  "Veste de costume": "Suit jackets",
  Gilet: "Waistcoats",
  Débardeurs: "Tank tops",
  Survetements: "Tracksuits",

  Slips: "Briefs",
  Boxers: "Boxers",
  Set: "Set",
  "Shaping underwear": "Shaping underwear",

  Stivali: "Boots",
  Bottines: "Ankle boots",
  Sneakers: "Sneakers",
  Mocassins: "Loafers",
  "Chaussures à lacets": "Lace-up shoes",
  Bottes: "Boots",
  "Nu-pieds et Tongs": "Sandals & flip-flops",
  Sandales: "Sandals",
  "Chaussures classiques": "Classic shoes",
  "Sandales à plateforme": "Platform sandals",
  Ballerines: "Ballet flats",
  "Slip-on": "Slip-on shoes",
  "Talons hauts": "High heels",

  Démaquillants: "Makeup removers",
  Visage: "Face care",
  Maquillage: "Makeup",
  Masques: "Masks",
};

export function translateCategory(nameFr: string): string {
  return CATEGORY_TRANSLATIONS[nameFr] ?? nameFr;
}

export interface CandidateProductSize {
  label: string;
  stock: number;
}

export interface CandidateProduct {
  slug: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  price: number;
  categoryFr: string;
  categoryEn: string;
  subcategoryFr: string;
  subcategoryEn: string;
  stock: number;
  sizes: CandidateProductSize[];
  images: string[];
}

export interface PriceOptions {
  fxRate: number;
  marginPercent: number;
}

function roundToNearestFive(value: number): number {
  return Math.round(value / 5) * 5;
}

/** Convertit un prix fournisseur (EUR) en FCFA avec taux de change + marge,
 * arrondi au multiple de 5 le plus proche (convention de prix locale). */
export function convertPrice(sellPriceEur: number, { fxRate, marginPercent }: PriceOptions): number {
  return roundToNearestFive(sellPriceEur * fxRate * (1 + marginPercent / 100));
}

/**
 * Transforme un groupe brut en produit candidat prêt à insérer. `usedSlugs`
 * doit être partagé entre tous les appels d'un même import : il est mis à
 * jour en place pour garantir l'unicité des slugs sur tout le lot (et,
 * l'appelant peut le pré-remplir avec les slugs déjà en base).
 */
export function toCandidateProduct(
  group: RawProductGroup,
  priceOptions: PriceOptions,
  usedSlugs: Set<string>,
): CandidateProduct {
  const categoryEn = translateCategory(group.categoryFr);
  const subcategoryEn = translateCategory(group.subcategoryFr);

  let slug = slugify(`${group.brand}-${group.code}`);
  let suffix = 2;
  const baseSlug = slug;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  usedSlugs.add(slug);

  const realSizes = group.models.filter((model) => model.size !== "NOSIZE" && model.size !== "");
  const sizes: CandidateProductSize[] = realSizes.map((model) => ({
    label: model.size,
    stock: model.quantity,
  }));
  const stock =
    sizes.length > 0
      ? sizes.reduce((sum, size) => sum + size.stock, 0)
      : group.models.reduce((sum, model) => sum + model.quantity, 0);

  return {
    slug,
    nameFr: `${group.brand} ${group.subcategoryFr}`.trim(),
    nameEn: `${group.brand} ${subcategoryEn}`.trim(),
    descriptionFr: stripHtml(group.descriptionHtml),
    descriptionEn: "",
    price: convertPrice(group.sellPriceEur, priceOptions),
    categoryFr: group.categoryFr,
    categoryEn,
    subcategoryFr: group.subcategoryFr,
    subcategoryEn,
    stock,
    sizes,
    images: group.images,
  };
}

export interface CataloguePreview {
  totalProducts: number;
  priceRangeEur: [number, number];
  categories: {
    nameFr: string;
    nameEn: string;
    count: number;
    subcategories: { nameFr: string; nameEn: string; count: number }[];
  }[];
  brands: { name: string; count: number }[];
}

export function summarizeGroups(groups: RawProductGroup[]): CataloguePreview {
  const categoryMap = new Map<string, Map<string, number>>();
  const brandCounts = new Map<string, number>();
  let min = Infinity;
  let max = -Infinity;

  for (const group of groups) {
    const subcats = categoryMap.get(group.categoryFr) ?? new Map<string, number>();
    subcats.set(group.subcategoryFr, (subcats.get(group.subcategoryFr) ?? 0) + 1);
    categoryMap.set(group.categoryFr, subcats);

    brandCounts.set(group.brand, (brandCounts.get(group.brand) ?? 0) + 1);

    if (group.sellPriceEur > 0) {
      min = Math.min(min, group.sellPriceEur);
      max = Math.max(max, group.sellPriceEur);
    }
  }

  const categories = [...categoryMap.entries()]
    .map(([nameFr, subcats]) => ({
      nameFr,
      nameEn: translateCategory(nameFr),
      count: [...subcats.values()].reduce((sum, n) => sum + n, 0),
      subcategories: [...subcats.entries()]
        .map(([subNameFr, count]) => ({ nameFr: subNameFr, nameEn: translateCategory(subNameFr), count }))
        .sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.count - a.count);

  const brands = [...brandCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalProducts: groups.length,
    priceRangeEur: groups.length > 0 ? [min, max] : [0, 0],
    categories,
    brands,
  };
}
