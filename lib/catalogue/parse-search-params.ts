import type { CatalogueFilters, SortOption } from "./types";

type RawSearchParams = Record<string, string | string[] | undefined>;

const SORT_OPTIONS: SortOption[] = ["newest", "price-asc", "price-desc"];

export function parseCatalogueSearchParams(
  searchParams: RawSearchParams,
): CatalogueFilters {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const minPrice = get("minPrice");
  const maxPrice = get("maxPrice");
  const sort = get("sort");

  return {
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStockOnly: get("inStock") === "1",
    sort: SORT_OPTIONS.includes(sort as SortOption)
      ? (sort as SortOption)
      : "newest",
  };
}
