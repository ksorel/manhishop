"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export interface AdminJobInput {
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  location: string;
  status: "active" | "draft";
}

export interface AdminJob extends AdminJobInput {
  id: string;
  slug: string;
}

const COLUMNS = "id, slug, title_fr, title_en, description_fr, description_en, location, status";

function toAdminJob(row: {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  location: string | null;
  status: "active" | "draft";
}): AdminJob {
  return {
    id: row.id,
    slug: row.slug,
    titleFr: row.title_fr,
    titleEn: row.title_en,
    descriptionFr: row.description_fr,
    descriptionEn: row.description_en,
    location: row.location ?? "",
    status: row.status,
  };
}

export async function getAdminJobs(): Promise<AdminJob[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toAdminJob);
}

export async function createJob(input: AdminJobInput): Promise<AdminJob> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      slug: slugify(input.titleFr),
      title_fr: input.titleFr,
      title_en: input.titleEn,
      description_fr: input.descriptionFr,
      description_en: input.descriptionEn,
      location: input.location || null,
      status: input.status,
    })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminJob(data);
}

export async function updateJob(id: string, input: AdminJobInput): Promise<AdminJob> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .update({
      title_fr: input.titleFr,
      title_en: input.titleEn,
      description_fr: input.descriptionFr,
      description_en: input.descriptionEn,
      location: input.location || null,
      status: input.status,
    })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminJob(data);
}

export async function deleteJob(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
}
