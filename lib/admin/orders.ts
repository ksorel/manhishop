"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin } from "@/lib/admin/guard";
import { fetchAllRows } from "@/lib/supabase/paginate";
import type { OrderDetail, OrderStatus } from "@/lib/orders/queries";

const REVERSIBLE_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered"];

/**
 * Reprend les effets d'une commande payée qu'on annule : points de
 * fidélité gagnés (achat) et bonus de parrainage crédités sur cette
 * commande, points que le client avait dépensés dessus, utilisation d'un
 * code promo. Sans ça, un client garde ses points/son bonus de
 * parrainage — et un code promo à usage limité perd une utilisation —
 * pour une commande jamais honorée au final.
 *
 * Utilise le client service-role : loyalty_transactions n'a aucune policy
 * d'insert (même pour un admin) et profiles.referral_rewarded n'est
 * modifiable que par son propriétaire via RLS — l'appelant doit donc
 * avoir déjà été vérifié admin via assertAdmin() avant d'appeler cette
 * fonction.
 */
async function reverseOrderEffectsIfNeeded(
  admin: ReturnType<typeof createAdminClient>,
  orderId: string,
): Promise<void> {
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, user_id, status, promo_code_id, points_redeemed")
    .eq("id", orderId)
    .single();
  if (orderError) throw orderError;
  if (!REVERSIBLE_STATUSES.includes(order.status as OrderStatus)) return;

  const { data: credited, error: creditedError } = await admin
    .from("loyalty_transactions")
    .select("user_id, points, reason")
    .eq("order_id", orderId)
    .in("reason", ["purchase", "referral_bonus"]);
  if (creditedError) throw creditedError;

  const reversalRows = (credited ?? []).map((row) => ({
    user_id: row.user_id,
    points: -row.points,
    reason: "cancellation_reversal" as const,
    order_id: orderId,
  }));

  if (order.points_redeemed > 0 && order.user_id) {
    reversalRows.push({
      user_id: order.user_id,
      points: order.points_redeemed,
      reason: "cancellation_reversal" as const,
      order_id: orderId,
    });
  }

  if (reversalRows.length > 0) {
    const { error } = await admin.from("loyalty_transactions").insert(reversalRows);
    if (error) throw error;
  }

  // Un bonus de parrainage repris doit pouvoir être regagné sur une
  // future commande de ce filleul réellement honorée.
  const hadReferralBonusForBuyer = (credited ?? []).some(
    (row) => row.reason === "referral_bonus" && row.user_id === order.user_id,
  );
  if (hadReferralBonusForBuyer && order.user_id) {
    const { error } = await admin
      .from("profiles")
      .update({ referral_rewarded: false })
      .eq("id", order.user_id);
    if (error) throw error;
  }

  if (order.promo_code_id) {
    const { data: promo } = await admin
      .from("promo_codes")
      .select("used_count")
      .eq("id", order.promo_code_id)
      .maybeSingle();
    if (promo && promo.used_count > 0) {
      const { error } = await admin
        .from("promo_codes")
        .update({ used_count: promo.used_count - 1 })
        .eq("id", order.promo_code_id);
      if (error) throw error;
    }
  }

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("product_id, size_id, quantity")
    .eq("order_id", orderId);
  if (itemsError) throw itemsError;

  for (const item of items ?? []) {
    if (!item.product_id) continue;
    const { error } = await admin.rpc("apply_stock_delta", {
      p_product_id: item.product_id,
      p_size_id: item.size_id,
      p_delta: item.quantity,
    });
    if (error) throw error;
  }
}

export interface AdminOrderSummary {
  id: string;
  status: OrderStatus;
  total: number;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}

const ORDER_DETAIL_COLUMNS = `
  id, status, subtotal, delivery_fee, discount_amount, points_redeemed, tracking_info, total, contact_email, contact_phone, created_at,
  addresses (full_name, line1, line2, city, country, phone),
  order_items (product_name, size_label, quantity, unit_price)
`;

export async function getAdminOrders(): Promise<AdminOrderSummary[]> {
  const supabase = await createClient();
  const data = await fetchAllRows<{
    id: string;
    status: string;
    total: number;
    contact_email: string;
    contact_phone: string;
    created_at: string;
  }>((from, to) =>
    supabase
      .from("orders")
      .select("id, status, total, contact_email, contact_phone, created_at")
      .order("created_at", { ascending: false })
      .range(from, to),
  );

  return data.map((row) => ({
    id: row.id,
    status: row.status as OrderStatus,
    total: Number(row.total),
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    createdAt: row.created_at,
  }));
}

export async function getAdminOrderById(orderId: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_COLUMNS)
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const address = Array.isArray(data.addresses) ? data.addresses[0] : data.addresses;

  return {
    id: data.id,
    status: data.status as OrderStatus,
    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.delivery_fee),
    discountAmount: Number(data.discount_amount),
    pointsRedeemed: data.points_redeemed,
    trackingInfo: data.tracking_info,
    total: Number(data.total),
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    createdAt: data.created_at,
    address: address
      ? {
          fullName: address.full_name,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          country: address.country,
          phone: address.phone,
        }
      : null,
    items: (data.order_items ?? []).map((item) => ({
      productName: item.product_name,
      sizeLabel: item.size_label,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
    })),
  };
}

export interface AdminOrderExportRow {
  id: string;
  status: OrderStatus;
  createdAt: string;
  contactEmail: string;
  contactPhone: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string | null;
  address: {
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    country: string;
  } | null;
  items: { productName: string; sizeLabel: string | null; quantity: number; unitPrice: number }[];
}

const ORDER_EXPORT_COLUMNS = `
  id, status, created_at, contact_email, contact_phone, subtotal, delivery_fee, total, payment_method,
  addresses (full_name, line1, line2, city, country),
  order_items (product_name, size_label, quantity, unit_price)
`;

interface OrderExportRawRow {
  id: string;
  status: string;
  created_at: string;
  contact_email: string;
  contact_phone: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string | null;
  addresses:
    | { full_name: string; line1: string; line2: string | null; city: string; country: string }
    | { full_name: string; line1: string; line2: string | null; city: string; country: string }[]
    | null;
  order_items: { product_name: string; size_label: string | null; quantity: number; unit_price: number }[];
}

export async function getAdminOrdersForExport(): Promise<AdminOrderExportRow[]> {
  const supabase = await createClient();
  const data = await fetchAllRows<OrderExportRawRow>((from, to) =>
    supabase
      .from("orders")
      .select(ORDER_EXPORT_COLUMNS)
      .order("created_at", { ascending: false })
      .range(from, to),
  );

  return data.map((row) => {
    const address = Array.isArray(row.addresses) ? row.addresses[0] : row.addresses;
    return {
      id: row.id,
      status: row.status as OrderStatus,
      createdAt: row.created_at,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      subtotal: Number(row.subtotal),
      deliveryFee: Number(row.delivery_fee),
      total: Number(row.total),
      paymentMethod: row.payment_method,
      address: address
        ? {
            fullName: address.full_name,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            country: address.country,
          }
        : null,
      items: (row.order_items ?? []).map((item) => ({
        productName: item.product_name,
        sizeLabel: item.size_label,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
      })),
    };
  });
}

const UPDATABLE_STATUSES: OrderStatus[] = ["shipped", "delivered", "cancelled"];

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!UPDATABLE_STATUSES.includes(status)) {
    throw new Error("invalid_status");
  }
  await assertAdmin();

  const admin = createAdminClient();
  if (status === "cancelled") {
    await reverseOrderEffectsIfNeeded(admin, orderId);
  }
  const { error } = await admin.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

export async function updateOrderTracking(orderId: string, trackingInfo: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ tracking_info: trackingInfo.trim() || null })
    .eq("id", orderId);
  if (error) throw error;
}

export async function bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus): Promise<void> {
  if (!UPDATABLE_STATUSES.includes(status)) {
    throw new Error("invalid_status");
  }
  if (orderIds.length === 0) return;
  await assertAdmin();

  const admin = createAdminClient();
  if (status === "cancelled") {
    for (const orderId of orderIds) {
      await reverseOrderEffectsIfNeeded(admin, orderId);
    }
  }
  const { error } = await admin.from("orders").update({ status }).in("id", orderIds);
  if (error) throw error;
}
