import { createClient } from "@/lib/supabase/server";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  contactEmail: string;
  contactPhone: string;
  address: {
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    country: string;
    phone: string;
  } | null;
  items: { productName: string; sizeLabel: string | null; quantity: number; unitPrice: number }[];
}

const ORDER_DETAIL_COLUMNS = `
  id, status, subtotal, delivery_fee, discount_amount, total, contact_email, contact_phone, created_at,
  addresses (full_name, line1, line2, city, country, phone),
  order_items (product_name, size_label, quantity, unit_price)
`;

export async function getMyOrders(): Promise<OrderSummary[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    status: row.status as OrderStatus,
    total: Number(row.total),
    createdAt: row.created_at,
  }));
}

export async function getMyOrderById(orderId: string): Promise<OrderDetail | null> {
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
