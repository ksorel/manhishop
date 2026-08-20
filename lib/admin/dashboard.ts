"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  salesToday: number;
  salesThisWeek: number;
  outOfStockCount: number;
  pendingOrdersCount: number;
  visitorsThisWeek: number;
  conversionRateThisWeek: number | null;
}

const PAID_STATUSES = ["paid", "shipped", "delivered"];

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [todayRes, weekRes, outOfStockRes, pendingRes, ordersWeekCountRes, visitorsWeekRes] =
    await Promise.all([
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
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", PAID_STATUSES)
        .gte("created_at", startOfWeek),
      supabase
        .from("page_visits")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfWeek),
    ]);

  const sum = (rows: { total: number }[] | null) =>
    (rows ?? []).reduce((total, row) => total + Number(row.total), 0);

  const visitorsThisWeek = visitorsWeekRes.count ?? 0;
  const ordersThisWeekCount = ordersWeekCountRes.count ?? 0;

  return {
    salesToday: sum(todayRes.data),
    salesThisWeek: sum(weekRes.data),
    outOfStockCount: outOfStockRes.count ?? 0,
    pendingOrdersCount: pendingRes.count ?? 0,
    visitorsThisWeek,
    // null (plutôt que 0) quand il n'y a pas encore assez de trafic pour
    // qu'un taux ait du sens — affiché différemment côté UI.
    conversionRateThisWeek:
      visitorsThisWeek > 0 ? (ordersThisWeekCount / visitorsThisWeek) * 100 : null,
  };
}
