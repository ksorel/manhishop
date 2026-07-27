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

  const parsePrice = (value: string | undefined) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const sort = get("sort");

  return {
    minPrice: parsePrice(get("minPrice")),
    maxPrice: parsePrice(get("maxPrice")),
    inStockOnly: get("inStock") === "1",
    sort: SORT_OPTIONS.includes(sort as SortOption)
      ? (sort as SortOption)
      : "newest",
  };
}
