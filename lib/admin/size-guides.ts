"use server";

import { createClient } from "@/lib/supabase/server";
import type { AdminSizeGuide, AdminSizeGuideInput, SizeGuideHeader } from "./types";

interface SizeGuideContentRow {
  headers: SizeGuideHeader[];
  rows: string[][];
}

function toAdminSizeGuide(row: {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string;
  display_order: number;
  content: SizeGuideContentRow;
}): AdminSizeGuide {
  return {
    id: row.id,
    slug: row.slug,
    titleFr: row.title_fr,
    titleEn: row.title_en,
    displayOrder: row.display_order,
    headers: row.content?.headers ?? [],
    rows: row.content?.rows ?? [],
  };
}

const COLUMNS = "id, slug, title_fr, title_en, display_order, content";

export async function getAdminSizeGuides(): Promise<AdminSizeGuide[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("size_guides")
    .select(COLUMNS)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toAdminSizeGuide);
}

export async function createSizeGuide(input: AdminSizeGuideInput): Promise<AdminSizeGuide> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("size_guides")
    .insert({
      slug: input.slug,
      title_fr: input.titleFr,
      title_en: input.titleEn,
      display_order: input.displayOrder,
      content: { headers: input.headers, rows: input.rows },
    })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminSizeGuide(data);
}

export async function updateSizeGuide(
  id: string,
  input: AdminSizeGuideInput,
): Promise<AdminSizeGuide> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("size_guides")
    .update({
      slug: input.slug,
      title_fr: input.titleFr,
      title_en: input.titleEn,
      display_order: input.displayOrder,
      content: { headers: input.headers, rows: input.rows },
    })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminSizeGuide(data);
}

export async function deleteSizeGuide(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("size_guides").delete().eq("id", id);
  if (error) throw error;
}
