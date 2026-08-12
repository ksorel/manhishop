"use server";

import { createClient } from "@/lib/supabase/server";
import type { FooterContent, HomeContent } from "@/lib/content/types";

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

export async function getAdminFooterContent(): Promise<FooterContent> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_content")
    .select(
      "contact_email, contact_phone, social_instagram, social_facebook, social_tiktok, social_whatsapp, cgv_fr, cgv_en, privacy_policy_fr, privacy_policy_en, legal_notice_fr, legal_notice_en",
    )
    .eq("id", 1)
    .single();

  if (error) throw error;

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
    legalNoticeFr: data.legal_notice_fr,
    legalNoticeEn: data.legal_notice_en,
  };
}

export async function updateFooterContent(input: FooterContent): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .update({
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      social_instagram: input.socialInstagram,
      social_facebook: input.socialFacebook,
      social_tiktok: input.socialTiktok,
      social_whatsapp: input.socialWhatsapp,
      cgv_fr: input.cgvFr,
      cgv_en: input.cgvEn,
      privacy_policy_fr: input.privacyPolicyFr,
      privacy_policy_en: input.privacyPolicyEn,
      legal_notice_fr: input.legalNoticeFr,
      legal_notice_en: input.legalNoticeEn,
    })
    .eq("id", 1);

  if (error) throw error;
}
