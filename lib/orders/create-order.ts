import { getProductsByIds } from "@/lib/catalogue/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Locale } from "@/lib/catalogue/types";
import type { CheckoutInput, PreparedOrder } from "./types";

/** Livraison à tarif fixe, zone unique — voir CLAUDE.md pour la grille définitive à trancher. */
export const DELIVERY_FEE_XOF = 1000;

/**
 * Crée une commande en statut `pending` avec le total recalculé côté
 * serveur à partir des prix actuels en base (jamais du prix envoyé par
 * le client). Le moyen de paiement (carte / mobile money) est choisi
 * par le client sur la page Paystack elle-même, donc pas encore connu
 * ici — il est renseigné par le webhook une fois le paiement confirmé.
 */
export async function createPendingOrder(
  input: CheckoutInput,
  userId: string | null,
  locale: Locale,
): Promise<PreparedOrder> {
  if (input.items.length === 0) throw new Error("empty_cart");

  const products = await getProductsByIds(
    input.items.map((item) => item.productId),
    locale,
  );

  const lines = input.items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      const quantity = Math.max(1, Math.min(Math.trunc(item.quantity), product.stock));
      if (quantity <= 0) return null;
      return {
        productId: product.id,
        name: product.name,
        unitPrice: product.promoPrice ?? product.price,
        quantity,
      };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  if (lines.length === 0) throw new Error("empty_cart");

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const deliveryFee = DELIVERY_FEE_XOF;
  const total = subtotal + deliveryFee;

  const admin = createAdminClient();

  const { data: address, error: addressError } = await admin
    .from("addresses")
    .insert({
      user_id: userId,
      full_name: input.address.fullName,
      line1: input.address.line1,
      line2: input.address.line2 ?? null,
      city: input.address.city,
      country: input.address.country,
      phone: input.address.phone,
    })
    .select("id")
    .single();

  if (addressError) throw addressError;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      locale,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      shipping_address_id: address.id,
    })
    .select("id, access_token")
    .single();

  if (orderError) throw orderError;

  const { error: itemsError } = await admin.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      product_id: line.productId,
      product_name: line.name,
      quantity: line.quantity,
      unit_price: line.unitPrice,
    })),
  );

  if (itemsError) throw itemsError;

  if (userId) {
    const { data: cart } = await admin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (cart) await admin.from("cart_items").delete().eq("cart_id", cart.id);
  }

  return {
    orderId: order.id,
    accessToken: order.access_token,
    subtotal,
    deliveryFee,
    total,
    contactEmail: input.contactEmail,
    locale,
    lines,
  };
}
