"use server";

import { createClient } from "@/lib/supabase/server";
import type { AdminCategory, AdminCategoryInput } from "./types";

function toAdminCategory(row: {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  display_order: number;
  parent_id: string | null;
}): AdminCategory {
  return {
    id: row.id,
    slug: row.slug,
    nameFr: row.name_fr,
    nameEn: row.name_en,
    displayOrder: row.display_order,
    parentId: row.parent_id,
  };
}

const COLUMNS = "id, slug, name_fr, name_en, display_order, parent_id";

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(COLUMNS)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toAdminCategory);
}

export async function createCategory(input: AdminCategoryInput): Promise<AdminCategory> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      slug: input.slug,
      name_fr: input.nameFr,
      name_en: input.nameEn,
      display_order: input.displayOrder,
      parent_id: input.parentId,
    })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminCategory(data);
}

export async function updateCategory(
  id: string,
  input: AdminCategoryInput,
): Promise<AdminCategory> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update({
      slug: input.slug,
      name_fr: input.nameFr,
      name_en: input.nameEn,
      display_order: input.displayOrder,
    })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminCategory(data);
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
