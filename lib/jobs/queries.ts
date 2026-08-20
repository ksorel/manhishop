import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/catalogue/types";

export interface JobSummary {
  id: string;
  slug: string;
  title: string;
  location: string | null;
}

export interface JobDetail extends JobSummary {
  description: string;
}

export async function getOpenJobs(locale: Locale): Promise<JobSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, slug, title_fr, title_en, location")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: locale === "fr" ? row.title_fr : row.title_en,
    location: row.location,
  }));
}

export async function getJobBySlug(slug: string, locale: Locale): Promise<JobDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, slug, title_fr, title_en, description_fr, description_en, location")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: locale === "fr" ? data.title_fr : data.title_en,
    description: locale === "fr" ? data.description_fr : data.description_en,
    location: data.location,
  };
}
