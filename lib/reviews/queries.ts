import { createClient } from "@/lib/supabase/server";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, rating, comment, author_name, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    authorName: row.author_name,
    createdAt: row.created_at,
  }));
}
