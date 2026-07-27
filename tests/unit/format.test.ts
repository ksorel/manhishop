import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats without decimals regardless of locale", () => {
    expect(formatPrice(12000, "fr")).not.toMatch(/[,.]00\D*$/);
    expect(formatPrice(12000, "en")).not.toMatch(/[,.]00\D*$/);
  });

  it("includes the numeric amount for both locales", () => {
    expect(formatPrice(12000, "fr")).toContain("12");
    expect(formatPrice(12000, "en")).toContain("12,000");
  });

  it("formats zero without throwing", () => {
    expect(() => formatPrice(0, "fr")).not.toThrow();
  });
});
