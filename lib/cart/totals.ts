import type { CartLine } from "./types";

export function computeCartTotals(items: CartLine[]) {
  const totalCount = items.reduce((sum, line) => sum + line.quantity, 0);
  const totalPrice = items.reduce(
    (sum, line) => sum + (line.product.promoPrice ?? line.product.price) * line.quantity,
    0,
  );

  return { totalCount, totalPrice };
}
