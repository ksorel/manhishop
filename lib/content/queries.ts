import { createClient } from "@/lib/supabase/server";
import type { HomeContent } from "./types";

// Repli utilisé si la ligne singleton n'existe pas encore (migration
// 0010 pas encore appliquée) : la page d'accueil ne doit jamais planter
// pour les visiteurs le temps que la migration soit exécutée en base.
const FALLBACK_HOME_CONTENT: HomeContent = {
  heroTitleFr: "Bienvenue chez Manhishop",
  heroTitleEn: "Welcome to Manhishop",
  heroSubtitleFr: "Des produits authentiques, livrés près de chez vous.",
  heroSubtitleEn: "Authentic products, delivered near you.",
};

export async function getHomeContent(): Promise<HomeContent> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("hero_title_fr, hero_title_en, hero_subtitle_fr, hero_subtitle_en")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return FALLBACK_HOME_CONTENT;

  return {
    heroTitleFr: data.hero_title_fr,
    heroTitleEn: data.hero_title_en,
    heroSubtitleFr: data.hero_subtitle_fr,
    heroSubtitleEn: data.hero_subtitle_en,
  };
}
