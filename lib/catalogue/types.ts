export type Locale = "fr" | "en";

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  parentId: string | null;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  price: number;
  promoPrice: number | null;
  stock: number;
  image: string | null;
  categorySlug: string | null;
  hasSizes: boolean;
}

export interface ProductSize {
  id: string;
  label: string;
  stock: number;
}

export interface SizeGuideContent {
  headers: { fr: string; en: string }[];
  rows: string[][];
}

export interface SizeGuide {
  id: string;
  title: string;
  content: SizeGuideContent;
}

export interface Product extends ProductSummary {
  description: string;
  images: string[];
  sizes: ProductSize[];
  sizeGuide: SizeGuide | null;
}

export type SortOption = "newest" | "price-asc" | "price-desc";

export interface CatalogueFilters {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: SortOption;
}
