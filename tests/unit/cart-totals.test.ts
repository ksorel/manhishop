import { describe, expect, it } from "vitest";
import { computeCartTotals } from "@/lib/cart/totals";
import type { CartLine } from "@/lib/cart/types";
import type { ProductSummary } from "@/lib/catalogue/types";

function product(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: "p1",
    slug: "produit",
    name: "Produit",
    price: 1000,
    promoPrice: null,
    stock: 10,
    image: null,
    categorySlug: null,
    hasSizes: false,
    ...overrides,
  };
}

function line(overrides: Partial<CartLine> & Pick<CartLine, "productId" | "quantity" | "product">): CartLine {
  return { sizeId: null, sizeLabel: null, sizeStock: null, ...overrides };
}

describe("computeCartTotals", () => {
  it("returns zero totals for an empty cart", () => {
    expect(computeCartTotals([])).toEqual({ totalCount: 0, totalPrice: 0 });
  });

  it("sums quantity and price across multiple lines", () => {
    const items: CartLine[] = [
      line({ productId: "p1", quantity: 2, product: product({ id: "p1", price: 1000 }) }),
      line({ productId: "p2", quantity: 3, product: product({ id: "p2", price: 500 }) }),
    ];

    expect(computeCartTotals(items)).toEqual({ totalCount: 5, totalPrice: 3500 });
  });

  it("uses the promo price instead of the regular price when set", () => {
    const items: CartLine[] = [
      line({
        productId: "p1",
        quantity: 2,
        product: product({ price: 1000, promoPrice: 700 }),
      }),
    ];

    expect(computeCartTotals(items)).toEqual({ totalCount: 2, totalPrice: 1400 });
  });
});
