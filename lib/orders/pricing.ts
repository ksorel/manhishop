import type { ProductSummary } from "@/lib/catalogue/types";
import type { CheckoutItemInput, PreparedOrderLine } from "./types";

/** Livraison à tarif fixe, zone unique — voir CLAUDE.md pour la grille définitive à trancher. */
export const DELIVERY_FEE_XOF = 1000;

/**
 * Construit les lignes de commande à partir des prix/stock actuels en
 * base (jamais du prix envoyé par le client). Un produit retiré/inactif
 * entre-temps, ou une quantité dépassant le stock disponible, est
 * silencieusement ajusté ou exclu plutôt que de faire planter la
 * commande.
 */
export function buildOrderLines(
  items: CheckoutItemInput[],
  products: ProductSummary[],
): PreparedOrderLine[] {
  return items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;

      const requestedQuantity = Math.max(1, Math.trunc(item.quantity));
      const quantity = Math.min(requestedQuantity, product.stock);
      if (quantity <= 0) return null;

      return {
        productId: product.id,
        name: product.name,
        unitPrice: product.promoPrice ?? product.price,
        quantity,
      };
    })
    .filter((line): line is PreparedOrderLine => line !== null);
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function computeOrderTotals(
  lines: PreparedOrderLine[],
  deliveryFee: number = DELIVERY_FEE_XOF,
): OrderTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
