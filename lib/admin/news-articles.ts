"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export interface AdminNewsArticleInput {
  titleFr: string;
  titleEn: string;
  bodyFr: string;
  bodyEn: string;
  status: "active" | "draft";
}

export interface AdminNewsArticle extends AdminNewsArticleInput {
  id: string;
  slug: string;
  imageUrl: string | null;
}

const COLUMNS = "id, slug, title_fr, title_en, body_fr, body_en, image_url, status";

function toAdminNewsArticle(row: {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string;
  body_fr: string;
  body_en: string;
  image_url: string | null;
  status: "active" | "draft";
}): AdminNewsArticle {
  return {
    id: row.id,
    slug: row.slug,
    titleFr: row.title_fr,
    titleEn: row.title_en,
    bodyFr: row.body_fr,
    bodyEn: row.body_en,
    imageUrl: row.image_url,
    status: row.status,
  };
}

export async function getAdminNewsArticles(): Promise<AdminNewsArticle[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_articles")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toAdminNewsArticle);
}

export async function createNewsArticle(input: AdminNewsArticleInput): Promise<AdminNewsArticle> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_articles")
    .insert({
      slug: slugify(input.titleFr),
      title_fr: input.titleFr,
      title_en: input.titleEn,
      body_fr: input.bodyFr,
      body_en: input.bodyEn,
      status: input.status,
    })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminNewsArticle(data);
}

export async function updateNewsArticle(
  id: string,
  input: AdminNewsArticleInput,
): Promise<AdminNewsArticle> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_articles")
    .update({
      title_fr: input.titleFr,
      title_en: input.titleEn,
      body_fr: input.bodyFr,
      body_en: input.bodyEn,
      status: input.status,
    })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminNewsArticle(data);
}

export async function deleteNewsArticle(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("news_articles").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadArticleImage(
  articleId: string,
  formData: FormData,
): Promise<string> {
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("no_file");

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${articleId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("article-images")
    .upload(path, file);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from("article-images").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("news_articles")
    .update({ image_url: publicUrlData.publicUrl })
    .eq("id", articleId);

  if (updateError) throw updateError;

  return publicUrlData.publicUrl;
}
