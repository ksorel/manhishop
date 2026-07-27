"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  salesToday: number;
  salesThisWeek: number;
  outOfStockCount: number;
  pendingOrdersCount: number;
}

const PAID_STATUSES = ["paid", "shipped", "delivered"];

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [todayRes, weekRes, outOfStockRes, pendingRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total")
      .in("status", PAID_STATUSES)
      .gte("created_at", startOfToday),
    supabase
      .from("orders")
      .select("total")
      .in("status", PAID_STATUSES)
      .gte("created_at", startOfWeek),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .lte("stock", 0),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const sum = (rows: { total: number }[] | null) =>
    (rows ?? []).reduce((total, row) => total + Number(row.total), 0);

  return {
    salesToday: sum(todayRes.data),
    salesThisWeek: sum(weekRes.data),
    outOfStockCount: outOfStockRes.count ?? 0,
    pendingOrdersCount: pendingRes.count ?? 0,
  };
}
