"use server";

import { createClient } from "@/lib/supabase/server";
import { getProductsByIds } from "@/lib/catalogue/queries";
import type { Locale, ProductSummary } from "@/lib/catalogue/types";

export async function getWishlist(locale: Locale): Promise<ProductSummary[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id);

  if (!data || data.length === 0) return [];
  return getProductsByIds(data.map((row) => row.product_id), locale);
}

export async function getWishlistProductIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id);

  return (data ?? []).map((row) => row.product_id);
}

export async function toggleWishlistItem(
  productId: string,
): Promise<{ status: "unauthenticated" } | { status: "ok"; inWishlist: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "unauthenticated" };

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id);
    return { status: "ok", inWishlist: false };
  }

  await supabase
    .from("wishlist_items")
    .insert({ user_id: user.id, product_id: productId });
  return { status: "ok", inWishlist: true };
}
