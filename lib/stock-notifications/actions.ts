"use server";

import { createClient } from "@/lib/supabase/server";

export async function subscribeToStockNotification(
  productId: string,
  sizeId: string | null,
): Promise<{ status: "unauthenticated" } | { status: "ok" }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "unauthenticated" };

  let existingQuery = supabase
    .from("stock_notifications")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId);
  existingQuery = sizeId ? existingQuery.eq("size_id", sizeId) : existingQuery.is("size_id", null);
  const { data: existing } = await existingQuery.maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from("stock_notifications")
      .insert({ user_id: user.id, product_id: productId, size_id: sizeId });
    if (error) throw error;
  }

  return { status: "ok" };
}
