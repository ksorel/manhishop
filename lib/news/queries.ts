import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/catalogue/types";

export interface NewsArticleSummary {
  slug: string;
  title: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface NewsArticleDetail extends NewsArticleSummary {
  body: string;
}

export async function getPublishedArticles(locale: Locale): Promise<NewsArticleSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_articles")
    .select("slug, title_fr, title_en, image_url, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    slug: row.slug,
    title: locale === "fr" ? row.title_fr : row.title_en,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  }));
}

export async function getArticleBySlug(
  slug: string,
  locale: Locale,
): Promise<NewsArticleDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_articles")
    .select("slug, title_fr, title_en, body_fr, body_en, image_url, created_at")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    slug: data.slug,
    title: locale === "fr" ? data.title_fr : data.title_en,
    body: locale === "fr" ? data.body_fr : data.body_en,
    imageUrl: data.image_url,
    createdAt: data.created_at,
  };
}
