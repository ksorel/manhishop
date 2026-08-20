"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/paginate";
import type { OrderDetail, OrderStatus } from "@/lib/orders/queries";

export interface AdminOrderSummary {
  id: string;
  status: OrderStatus;
  total: number;
  contactEmail: string;
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
    created_at: string;
  }>((from, to) =>
    supabase
      .from("orders")
      .select("id, status, total, contact_email, created_at")
      .order("created_at", { ascending: false })
      .range(from, to),
  );

  return data.map((row) => ({
    id: row.id,
    status: row.status as OrderStatus,
    total: Number(row.total),
    contactEmail: row.contact_email,
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

export async function getAdminOrdersForExport(): Promise<AdminOrderExportRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_EXPORT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
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

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
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

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).in("id", orderIds);
  if (error) throw error;
}
