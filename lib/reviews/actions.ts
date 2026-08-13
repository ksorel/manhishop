"use server";

import { createClient } from "@/lib/supabase/server";

const PURCHASED_STATUSES = ["paid", "shipped", "delivered"];

async function hasPurchased(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  productId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("order_items")
    .select("id, orders!inner(user_id, status)")
    .eq("product_id", productId)
    .eq("orders.user_id", userId)
    .in("orders.status", PURCHASED_STATUSES)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

export async function getReviewEligibility(
  productId: string,
): Promise<{ canReview: boolean; myReviewId: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { canReview: false, myReviewId: null };

  const [purchased, { data: existing }] = await Promise.all([
    hasPurchased(supabase, user.id, productId),
    supabase
      .from("product_reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return { canReview: purchased, myReviewId: existing?.id ?? null };
}

export async function submitReview(
  productId: string,
  rating: number,
  comment: string,
): Promise<{ status: "unauthenticated" | "not_purchased" | "ok" }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "unauthenticated" };

  if (!(await hasPurchased(supabase, user.id, productId))) {
    return { status: "not_purchased" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const authorName = profile?.full_name?.trim() || "Client Manhishop";

  const { error } = await supabase.from("product_reviews").upsert(
    { product_id: productId, user_id: user.id, rating, comment, author_name: authorName },
    { onConflict: "product_id,user_id" },
  );
  if (error) throw error;

  return { status: "ok" };
}

export async function deleteMyReview(reviewId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);
  if (error) throw error;
}
