import { describe, expect, it } from "vitest";
import { parseCatalogueSearchParams } from "@/lib/catalogue/parse-search-params";

describe("parseCatalogueSearchParams", () => {
  it("defaults to newest with no filters applied", () => {
    expect(parseCatalogueSearchParams({})).toEqual({
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: false,
      sort: "newest",
    });
  });

  it("parses valid numeric price bounds", () => {
    const result = parseCatalogueSearchParams({ minPrice: "1000", maxPrice: "5000" });
    expect(result.minPrice).toBe(1000);
    expect(result.maxPrice).toBe(5000);
  });

  it("ignores a non-numeric price instead of passing NaN through", () => {
    const result = parseCatalogueSearchParams({ minPrice: "abc" });
    expect(result.minPrice).toBeUndefined();
  });

  it("falls back to newest for an unrecognized sort value", () => {
    expect(parseCatalogueSearchParams({ sort: "cheapest-first" }).sort).toBe("newest");
  });

  it("accepts a known sort value", () => {
    expect(parseCatalogueSearchParams({ sort: "price-asc" }).sort).toBe("price-asc");
  });

  it("takes the first value when a param is repeated", () => {
    expect(parseCatalogueSearchParams({ sort: ["price-desc", "newest"] }).sort).toBe(
      "price-desc",
    );
  });
});
