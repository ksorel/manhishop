"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/paginate";

export interface AdminReview {
  id: string;
  productNameFr: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

interface AdminReviewRow {
  id: string;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
  product: { name_fr: string } | { name_fr: string }[] | null;
}

export async function getAdminReviews(): Promise<AdminReview[]> {
  const supabase = await createClient();
  const data = await fetchAllRows<AdminReviewRow>((from, to) =>
    supabase
      .from("product_reviews")
      .select("id, rating, comment, author_name, created_at, product:products(name_fr)")
      .order("created_at", { ascending: false })
      .range(from, to),
  );

  return data.map((row) => {
    const product = Array.isArray(row.product) ? row.product[0] : row.product;
    return {
      id: row.id,
      productNameFr: product?.name_fr ?? "—",
      rating: row.rating,
      comment: row.comment,
      authorName: row.author_name,
      createdAt: row.created_at,
    };
  });
}

export async function deleteReview(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_reviews").delete().eq("id", id);
  if (error) throw error;
}
