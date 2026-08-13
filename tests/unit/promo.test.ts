import { describe, expect, it } from "vitest";
import { computeDiscount } from "@/lib/promo/validate";

describe("computeDiscount", () => {
  it("computes a percentage discount", () => {
    expect(computeDiscount("percent", 10, 1000)).toBe(100);
  });

  it("rounds a percentage discount", () => {
    expect(computeDiscount("percent", 15, 999)).toBe(150); // 149.85 -> 150
  });

  it("applies a fixed discount", () => {
    expect(computeDiscount("fixed", 500, 2000)).toBe(500);
  });

  it("caps the discount at the subtotal, never negative total", () => {
    expect(computeDiscount("fixed", 5000, 2000)).toBe(2000);
    expect(computeDiscount("percent", 100, 2000)).toBe(2000);
  });

  it("returns 0 for a zero subtotal", () => {
    expect(computeDiscount("percent", 10, 0)).toBe(0);
    expect(computeDiscount("fixed", 500, 0)).toBe(0);
  });
});
