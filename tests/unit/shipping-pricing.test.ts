import { describe, expect, it } from "vitest";
import { FALLBACK_SHIPPING_FEE_XOF, resolveShippingFee } from "@/lib/shipping/pricing";
import type { ShippingRate } from "@/lib/shipping/types";

const rates: ShippingRate[] = [
  { id: "1", country: "ci", city: "Abidjan", fee: 1000 },
  { id: "2", country: "ci", city: null, fee: 2000 },
  { id: "3", country: "sn", city: null, fee: 5000 },
];

describe("resolveShippingFee", () => {
  it("uses the city-specific rate when it matches", () => {
    expect(resolveShippingFee(rates, "ci", "Abidjan")).toBe(1000);
  });

  it("is case-insensitive and trims whitespace for the city match", () => {
    expect(resolveShippingFee(rates, "ci", "  abidjan  ")).toBe(1000);
  });

  it("falls back to the country default when the city doesn't match", () => {
    expect(resolveShippingFee(rates, "ci", "Bouaké")).toBe(2000);
  });

  it("uses the country default for a country with no city-specific rates", () => {
    expect(resolveShippingFee(rates, "sn", "Dakar")).toBe(5000);
  });

  it("falls back to a safe default when the country has no configured rate at all", () => {
    expect(resolveShippingFee(rates, "gh", "Accra")).toBe(FALLBACK_SHIPPING_FEE_XOF);
  });
});
