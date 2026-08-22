import { describe, expect, it } from "vitest";
import { computeEarnedPoints } from "@/lib/loyalty/constants";

describe("computeEarnedPoints", () => {
  it("earns 1 point per 100 FCFA actually paid", () => {
    expect(computeEarnedPoints(12000, 0, 0)).toBe(120);
  });

  it("deducts the promo discount before computing points", () => {
    expect(computeEarnedPoints(12000, 1200, 0)).toBe(108);
  });

  it("deducts the value of points already redeemed on the same order — regression for the 2026-08-22 bug", () => {
    // Sans la correction, ces 340 points dépensés (3400 FCFA) n'étaient
    // pas déduits du sous-total, laissant le client regagner des points
    // sur un montant qu'il n'avait pas réellement payé.
    expect(computeEarnedPoints(12000, 1200, 340)).toBe(74);
  });

  it("never earns points on an order paid entirely with points", () => {
    expect(computeEarnedPoints(12000, 0, 1200)).toBe(0);
  });

  it("floors instead of rounding up", () => {
    expect(computeEarnedPoints(199, 0, 0)).toBe(1);
    expect(computeEarnedPoints(99, 0, 0)).toBe(0);
  });
});
