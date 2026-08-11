import { createClient } from "@/lib/supabase/server";
import { getDescendantCategoryIds } from "./category-tree";
import type {
  CatalogueFilters,
  Category,
  Locale,
  Product,
  ProductSummary,
} from "./types";

const PRODUCT_SUMMARY_COLUMNS =
  "id, slug, name_fr, name_en, price, promo_price, stock, category:categories(slug), product_images(url, display_order), product_sizes(id)";

type ProductSummaryRow = {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  price: number;
  promo_price: number | null;
  stock: number;
  category: { slug: string } | { slug: string }[] | null;
  product_images: { url: string; display_order: number }[] | null;
  product_sizes: { id: string }[] | null;
};

function firstImage(images: ProductSummaryRow["product_images"]) {
  if (!images || images.length === 0) return null;
  return [...images].sort((a, b) => a.display_order - b.display_order)[0].url;
}

function categorySlugOf(category: ProductSummaryRow["category"]) {
  if (!category) return null;
  return Array.isArray(category) ? (category[0]?.slug ?? null) : category.slug;
}

function toProductSummary(row: ProductSummaryRow, locale: Locale): ProductSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: locale === "fr" ? row.name_fr : row.name_en,
    price: Number(row.price),
    promoPrice: row.promo_price === null ? null : Number(row.promo_price),
    stock: row.stock,
    image: firstImage(row.product_images),
    categorySlug: categorySlugOf(row.category),
    hasSizes: (row.product_sizes ?? []).length > 0,
  };
}

function toCategory(
  row: { id: string; slug: string; name_fr: string; name_en: string; image: string | null; parent_id: string | null },
  locale: Locale,
): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: locale === "fr" ? row.name_fr : row.name_en,
    image: row.image,
    parentId: row.parent_id,
  };
}

export async function getCategories(locale: Locale): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_fr, name_en, image, parent_id")
    .is("parent_id", null)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => toCategory(row, locale));
}

/** Toutes les catégories (racines et sous-catégories), utilisé pour
 * dériver la navigation en sous-catégories et le fil d'Ariane sur une
 * page catégorie. */
export async function getAllCategories(locale: Locale): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_fr, name_en, image, parent_id")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => toCategory(row, locale));
}

export async function getCategoryBySlug(
  slug: string,
  locale: Locale,
): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_fr, name_en, image, parent_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toCategory(data, locale);
}

export async function getProducts(
  locale: Locale,
  filters: CatalogueFilters = {},
): Promise<ProductSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .eq("status", "active");

  if (filters.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();

    if (!category) return [];

    const { data: allCategories, error: allCategoriesError } = await supabase
      .from("categories")
      .select("id, parent_id");
    if (allCategoriesError) throw allCategoriesError;

    const categoryIds = getDescendantCategoryIds(
      (allCategories ?? []).map((row) => ({ id: row.id, parentId: row.parent_id })),
      category.id,
    );
    query = query.in("category_id", categoryIds);
  }

  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.inStockOnly) query = query.gt("stock", 0);

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) =>
    toProductSummary(row as unknown as ProductSummaryRow, locale),
  );
}

export async function getFeaturedProducts(
  locale: Locale,
  limit = 8,
): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .eq("status", "active")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) =>
    toProductSummary(row as unknown as ProductSummaryRow, locale),
  );
}

export async function getPromotedProducts(
  locale: Locale,
  limit = 8,
): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .eq("status", "active")
    .or("featured.eq.true,promo_price.not.is.null")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? [])
    .map((row) => toProductSummary(row as unknown as ProductSummaryRow, locale))
    .filter((product) => product.image !== null);
}

export async function getSimilarProducts(
  categorySlug: string | null,
  excludeProductId: string,
  locale: Locale,
  limit = 4,
): Promise<ProductSummary[]> {
  if (!categorySlug) return [];

  const products = await getProducts(locale, { categorySlug });
  return products.filter((p) => p.id !== excludeProductId).slice(0, limit);
}

export async function getProductBySlug(
  slug: string,
  locale: Locale,
): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name_fr, name_en, description_fr, description_en, price, promo_price, stock, category:categories(slug), product_images(url, display_order), product_sizes(id, label, stock, display_order), size_guide:size_guides(id, title_fr, title_en, content)",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const images = (data.product_images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => img.url);

  const sizes = (data.product_sizes ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((size) => ({ id: size.id, label: size.label, stock: size.stock }));

  const sizeGuideRow = Array.isArray(data.size_guide) ? data.size_guide[0] : data.size_guide;

  return {
    id: data.id,
    slug: data.slug,
    name: locale === "fr" ? data.name_fr : data.name_en,
    description: locale === "fr" ? data.description_fr : data.description_en,
    price: Number(data.price),
    promoPrice: data.promo_price === null ? null : Number(data.promo_price),
    stock: data.stock,
    image: images[0] ?? null,
    images,
    categorySlug: categorySlugOf(
      data.category as ProductSummaryRow["category"],
    ),
    hasSizes: sizes.length > 0,
    sizes,
    sizeGuide: sizeGuideRow
      ? {
          id: sizeGuideRow.id,
          title: locale === "fr" ? sizeGuideRow.title_fr : sizeGuideRow.title_en,
          content: sizeGuideRow.content,
        }
      : null,
  };
}

export async function getProductsByIds(
  ids: string[],
  locale: Locale,
): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .eq("status", "active")
    .in("id", ids);

  if (error) throw error;

  return (data ?? []).map((row) =>
    toProductSummary(row as unknown as ProductSummaryRow, locale),
  );
}

export async function searchProducts(
  locale: Locale,
  query: string,
): Promise<ProductSummary[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = await createClient();
  const column = locale === "fr" ? "search_fr" : "search_en";
  const config = locale === "fr" ? "french" : "english";

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .eq("status", "active")
    .textSearch(column, trimmed, { type: "plain", config });

  if (error) throw error;

  return (data ?? []).map((row) =>
    toProductSummary(row as unknown as ProductSummaryRow, locale),
  );
}
