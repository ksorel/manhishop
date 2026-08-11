"use server";

import { createClient } from "@/lib/supabase/server";
import type { OrderDetail, OrderStatus } from "@/lib/orders/queries";

export interface AdminOrderSummary {
  id: string;
  status: OrderStatus;
  total: number;
  contactEmail: string;
  createdAt: string;
}

const ORDER_DETAIL_COLUMNS = `
  id, status, subtotal, delivery_fee, total, contact_email, contact_phone, created_at,
  addresses (full_name, line1, line2, city, country, phone),
  order_items (product_name, size_label, quantity, unit_price)
`;

export async function getAdminOrders(): Promise<AdminOrderSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, contact_email, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
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

const UPDATABLE_STATUSES: OrderStatus[] = ["shipped", "delivered", "cancelled"];

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!UPDATABLE_STATUSES.includes(status)) {
    throw new Error("invalid_status");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}
