import { describe, expect, it } from "vitest";
import { buildOrderLines, computeOrderTotals, DELIVERY_FEE_XOF } from "@/lib/orders/pricing";
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

describe("buildOrderLines", () => {
  it("uses the current server-side price, ignoring anything the client might send", () => {
    const products = [product({ id: "p1", price: 1000 })];
    const lines = buildOrderLines([{ productId: "p1", quantity: 2 }], products);

    expect(lines).toEqual([
      { productId: "p1", sizeId: null, name: "Produit", sizeLabel: null, unitPrice: 1000, quantity: 2 },
    ]);
  });

  it("prefers the promo price when one is set", () => {
    const products = [product({ price: 1000, promoPrice: 800 })];
    const lines = buildOrderLines([{ productId: "p1", quantity: 1 }], products);

    expect(lines[0].unitPrice).toBe(800);
  });

  it("caps the requested quantity to the available stock", () => {
    const products = [product({ stock: 3 })];
    const lines = buildOrderLines([{ productId: "p1", quantity: 50 }], products);

    expect(lines[0].quantity).toBe(3);
  });

  it("drops items whose product no longer exists", () => {
    const lines = buildOrderLines([{ productId: "missing", quantity: 1 }], []);
    expect(lines).toEqual([]);
  });

  it("drops items that are out of stock", () => {
    const products = [product({ stock: 0 })];
    const lines = buildOrderLines([{ productId: "p1", quantity: 1 }], products);
    expect(lines).toEqual([]);
  });
});

describe("computeOrderTotals", () => {
  it("adds the fixed delivery fee to the sum of the lines", () => {
    const lines = [
      { productId: "p1", sizeId: null, name: "A", sizeLabel: null, unitPrice: 1000, quantity: 2 },
      { productId: "p2", sizeId: null, name: "B", sizeLabel: null, unitPrice: 500, quantity: 1 },
    ];

    expect(computeOrderTotals(lines)).toEqual({
      subtotal: 2500,
      deliveryFee: DELIVERY_FEE_XOF,
      total: 2500 + DELIVERY_FEE_XOF,
    });
  });

  it("returns just the delivery fee for an empty cart", () => {
    expect(computeOrderTotals([])).toEqual({
      subtotal: 0,
      deliveryFee: DELIVERY_FEE_XOF,
      total: DELIVERY_FEE_XOF,
    });
  });
});
