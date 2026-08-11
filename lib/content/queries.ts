import { createClient } from "@/lib/supabase/server";
import type { FooterContent, HomeContent } from "./types";

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

// Repli si les colonnes n'existent pas encore (migration 0013 pas
// encore appliquée) : tout vide, donc rien ne s'affiche dans le footer
// (voir le rendu conditionnel dans SiteFooter) plutôt que de planter.
const FALLBACK_FOOTER_CONTENT: FooterContent = {
  contactEmail: "",
  contactPhone: "",
  socialInstagram: "",
  socialFacebook: "",
  socialTiktok: "",
  socialWhatsapp: "",
  cgvFr: "",
  cgvEn: "",
  privacyPolicyFr: "",
  privacyPolicyEn: "",
};

export async function getFooterContent(): Promise<FooterContent> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_content")
    .select(
      "contact_email, contact_phone, social_instagram, social_facebook, social_tiktok, social_whatsapp, cgv_fr, cgv_en, privacy_policy_fr, privacy_policy_en",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return FALLBACK_FOOTER_CONTENT;

  return {
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    socialInstagram: data.social_instagram,
    socialFacebook: data.social_facebook,
    socialTiktok: data.social_tiktok,
    socialWhatsapp: data.social_whatsapp,
    cgvFr: data.cgv_fr,
    cgvEn: data.cgv_en,
    privacyPolicyFr: data.privacy_policy_fr,
    privacyPolicyEn: data.privacy_policy_en,
  };
}
