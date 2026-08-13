export type DiscountType = "percent" | "fixed";

/** Toujours plafonné au sous-total (jamais de total négatif) et arrondi. */
export function computeDiscount(
  discountType: DiscountType,
  discountValue: number,
  subtotal: number,
): number {
  const raw = discountType === "percent" ? subtotal * (discountValue / 100) : discountValue;
  return Math.min(Math.round(raw), subtotal);
}
