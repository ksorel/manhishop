"use server";

import { getProductsByIds } from "@/lib/catalogue/queries";
import type { Locale, ProductSummary } from "@/lib/catalogue/types";

/** getProductsByIds ne garantit pas l'ordre de retour — on le réaligne ici
 * sur l'ordre de sélection. */
export async function getCompareProducts(
  ids: string[],
  locale: Locale,
): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];

  const products = await getProductsByIds(ids, locale);
  const byId = new Map(products.map((p) => [p.id, p]));

  return ids.map((id) => byId.get(id)).filter((p): p is ProductSummary => !!p);
}
