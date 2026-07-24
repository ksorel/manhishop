export type Locale = "fr" | "en";

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string | null;
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
}

export interface Product extends ProductSummary {
  description: string;
  images: string[];
}

export type SortOption = "newest" | "price-asc" | "price-desc";

export interface CatalogueFilters {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: SortOption;
}
