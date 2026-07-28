"use server";

import { createClient } from "@/lib/supabase/server";
import type { HomeContent } from "@/lib/content/types";

export async function getAdminHomeContent(): Promise<HomeContent> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("hero_title_fr, hero_title_en, hero_subtitle_fr, hero_subtitle_en")
    .eq("id", 1)
    .single();

  if (error) throw error;

  return {
    heroTitleFr: data.hero_title_fr,
    heroTitleEn: data.hero_title_en,
    heroSubtitleFr: data.hero_subtitle_fr,
    heroSubtitleEn: data.hero_subtitle_en,
  };
}

export async function updateHomeContent(input: HomeContent): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .update({
      hero_title_fr: input.heroTitleFr,
      hero_title_en: input.heroTitleEn,
      hero_subtitle_fr: input.heroSubtitleFr,
      hero_subtitle_en: input.heroSubtitleEn,
    })
    .eq("id", 1);

  if (error) throw error;
}
