import { getProductsByIds } from "@/lib/catalogue/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveShippingFee } from "@/lib/shipping/pricing";
import { computeDiscount } from "@/lib/promo/validate";
import { getLoyaltyBalance } from "@/lib/loyalty/queries";
import { POINTS_TO_FCFA } from "@/lib/loyalty/constants";
import type { ShippingRate } from "@/lib/shipping/types";
import type { Locale } from "@/lib/catalogue/types";
import type { CheckoutInput, PreparedOrder } from "./types";
import { buildOrderLines, computeOrderTotals, type OrderSizeInfo } from "./pricing";

/**
 * Crée une commande en statut `pending` avec le total recalculé côté
 * serveur à partir des prix actuels en base (jamais du prix envoyé par
 * le client) — y compris les frais de livraison, résolus depuis la
 * grille tarifaire (supabase/migrations/0009_shipping_rates.sql) selon
 * le pays/la ville de l'adresse finale, jamais depuis un montant envoyé
 * par le client. Le moyen de paiement (carte / mobile money) est choisi
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

  const admin = createAdminClient();

  const sizeIds = input.items
    .map((item) => item.sizeId)
    .filter((id): id is string => !!id);

  const sizesById = new Map<string, OrderSizeInfo>();
  if (sizeIds.length > 0) {
    const { data: sizeRows, error: sizesError } = await admin
      .from("product_sizes")
      .select("id, product_id, label, stock")
      .in("id", sizeIds);

    if (sizesError) throw sizesError;
    for (const row of sizeRows ?? []) {
      sizesById.set(row.id, { productId: row.product_id, label: row.label, stock: row.stock });
    }
  }

  const lines = buildOrderLines(input.items, products, sizesById);
  if (lines.length === 0) throw new Error("empty_cart");

  let shippingAddressId: string;
  let country: string;
  let city: string;

  if ("addressId" in input.address) {
    // Adresse enregistrée réutilisée : on vérifie qu'elle appartient
    // bien à cet utilisateur avant de la lier à la commande.
    const { data: existing, error: existingError } = await admin
      .from("addresses")
      .select("id, country, city")
      .eq("id", input.address.addressId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) throw new Error("address_not_found");
    shippingAddressId = existing.id;
    country = existing.country;
    city = existing.city;
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
    country = input.address.country;
    city = input.address.city;
  }

  const { data: shippingRatesData, error: shippingRatesError } = await admin
    .from("shipping_rates")
    .select("id, country, city, fee");

  if (shippingRatesError) throw shippingRatesError;

  const shippingRates: ShippingRate[] = (shippingRatesData ?? []).map((row) => ({
    id: row.id,
    country: row.country,
    city: row.city,
    fee: Number(row.fee),
  }));

  const deliveryFee = resolveShippingFee(shippingRates, country, city);
  const { subtotal } = computeOrderTotals(lines, deliveryFee);

  // Le client n'envoie qu'un code, jamais un montant de réduction — celui-ci
  // est toujours recalculé ici à partir de la ligne promo_codes en base.
  let discountAmount = 0;
  let promoCodeId: string | null = null;
  if (input.promoCode) {
    const { data: promo, error: promoError } = await admin
      .from("promo_codes")
      .select("id, discount_type, discount_value, active, expires_at, max_uses, used_count")
      .eq("code", input.promoCode.trim().toUpperCase())
      .maybeSingle();

    if (promoError) throw promoError;
    const now = new Date();
    const isValid =
      !!promo &&
      promo.active &&
      (!promo.expires_at || new Date(promo.expires_at) > now) &&
      (promo.max_uses === null || promo.used_count < promo.max_uses);

    if (!promo || !isValid) throw new Error("invalid_promo_code");

    promoCodeId = promo.id;
    discountAmount = computeDiscount(
      promo.discount_type as "percent" | "fixed",
      Number(promo.discount_value),
      subtotal,
    );
  }

  // Points de fidélité : le client n'envoie qu'un nombre de points
  // souhaité, jamais un montant — le solde réel est relu en base et le
  // nombre de points effectivement dépensés est plafonné à la fois par ce
  // solde et par ce qu'il reste à payer après la réduction du code promo
  // (jamais de total négatif, jamais plus de points que ceux possédés).
  let pointsRedeemed = 0;
  if (input.redeemPoints && userId) {
    const balance = await getLoyaltyBalance(userId);
    const requestedPoints = Math.max(0, Math.trunc(input.redeemPoints));
    const remainingAfterPromo = subtotal - discountAmount;
    const maxAffordablePoints = Math.floor(remainingAfterPromo / POINTS_TO_FCFA);
    pointsRedeemed = Math.min(requestedPoints, balance, maxAffordablePoints);
  }
  const pointsDiscountAmount = pointsRedeemed * POINTS_TO_FCFA;

  const total = Math.max(0, subtotal - discountAmount - pointsDiscountAmount) + deliveryFee;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      locale,
      subtotal,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      promo_code_id: promoCodeId,
      points_redeemed: pointsRedeemed,
      total,
      shipping_address_id: shippingAddressId,
    })
    .select("id, access_token")
    .single();

  if (orderError) throw orderError;

  if (pointsRedeemed > 0 && userId) {
    await admin.from("loyalty_transactions").insert({
      user_id: userId,
      points: -pointsRedeemed,
      reason: "redemption",
      order_id: order.id,
    });
  }

  if (promoCodeId) {
    // Best-effort, pas de transaction (cohérent avec le reste de cette
    // fonction) : une commande créée en même temps qu'une autre sur le même
    // code pourrait sous-compter d'une unité dans de très rares cas, sans
    // conséquence à l'échelle de cette boutique.
    const { data: current } = await admin
      .from("promo_codes")
      .select("used_count")
      .eq("id", promoCodeId)
      .maybeSingle();
    if (current) {
      await admin
        .from("promo_codes")
        .update({ used_count: current.used_count + 1 })
        .eq("id", promoCodeId);
    }
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      product_id: line.productId,
      product_name: line.name,
      size_label: line.sizeLabel,
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
    discountAmount,
    pointsRedeemed,
    total,
    contactEmail: input.contactEmail,
    locale,
    lines,
  };
}
