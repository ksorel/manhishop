import { getProductsByIds } from "@/lib/catalogue/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Locale } from "@/lib/catalogue/types";
import type { CheckoutInput, PreparedOrder } from "./types";
import { buildOrderLines, computeOrderTotals, DELIVERY_FEE_XOF } from "./pricing";

export { DELIVERY_FEE_XOF };

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

  const lines = buildOrderLines(input.items, products);
  if (lines.length === 0) throw new Error("empty_cart");

  const { subtotal, deliveryFee, total } = computeOrderTotals(lines);

  const admin = createAdminClient();

  let shippingAddressId: string;

  if ("addressId" in input.address) {
    // Adresse enregistrée réutilisée : on vérifie qu'elle appartient
    // bien à cet utilisateur avant de la lier à la commande.
    const { data: existing, error: existingError } = await admin
      .from("addresses")
      .select("id")
      .eq("id", input.address.addressId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) throw new Error("address_not_found");
    shippingAddressId = existing.id;
  } else {
    // Nouvelle adresse : si l'utilisateur est connecté, elle est
    // automatiquement rattachée à son compte (visible dans son carnet
    // d'adresses ensuite) grâce à user_id.
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
    shippingAddressId = address.id;
  }

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
      shipping_address_id: shippingAddressId,
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
