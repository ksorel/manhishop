import type { ProductSummary } from "@/lib/catalogue/types";
import type { CheckoutItemInput, PreparedOrderLine } from "./types";

/** Livraison à tarif fixe, zone unique — voir CLAUDE.md pour la grille définitive à trancher. */
export const DELIVERY_FEE_XOF = 1000;

export interface OrderSizeInfo {
  productId: string;
  label: string;
  stock: number;
}

/**
 * Construit les lignes de commande à partir des prix/stock actuels en
 * base (jamais du prix envoyé par le client). Un produit retiré/inactif
 * entre-temps, une taille invalide/inconnue, une commande sans taille
 * pour un produit qui en requiert une, ou une quantité dépassant le
 * stock disponible (du produit, ou de la taille choisie), est
 * silencieusement ajustée ou exclue plutôt que de faire planter la
 * commande.
 */
export function buildOrderLines(
  items: CheckoutItemInput[],
  products: ProductSummary[],
  sizesById: Map<string, OrderSizeInfo> = new Map(),
): PreparedOrderLine[] {
  return items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;

      let availableStock = product.stock;
      let sizeLabel: string | null = null;

      if (product.hasSizes) {
        const size = item.sizeId ? sizesById.get(item.sizeId) : undefined;
        if (!size || size.productId !== product.id) return null;
        availableStock = size.stock;
        sizeLabel = size.label;
      }

      const requestedQuantity = Math.max(1, Math.trunc(item.quantity));
      const quantity = Math.min(requestedQuantity, availableStock);
      if (quantity <= 0) return null;

      return {
        productId: product.id,
        name: product.name,
        sizeLabel,
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
