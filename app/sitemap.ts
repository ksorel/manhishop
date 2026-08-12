import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

const STATIC_PATHS = ["", "/catalogue", "/guide-tailles", "/recherche"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const [{ data: categories }, { data: products }, { data: content }] = await Promise.all([
    supabase.from("categories").select("slug, created_at"),
    supabase.from("products").select("slug, updated_at").eq("status", "active"),
    supabase
      .from("site_content")
      .select("cgv_fr, privacy_policy_fr, legal_notice_fr")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const legalPages = [
    { path: "/cgv", enabled: !!content?.cgv_fr },
    { path: "/confidentialite", enabled: !!content?.privacy_policy_fr },
    { path: "/mentions-legales", enabled: !!content?.legal_notice_fr },
  ].filter((page) => page.enabled);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({ url: `${SITE_URL}/${locale}${path}`, lastModified: new Date() });
    }

    for (const page of legalPages) {
      entries.push({ url: `${SITE_URL}/${locale}${page.path}`, lastModified: new Date() });
    }

    for (const category of categories ?? []) {
      entries.push({
        url: `${SITE_URL}/${locale}/catalogue/${category.slug}`,
        lastModified: category.created_at ? new Date(category.created_at) : undefined,
      });
    }

    for (const product of products ?? []) {
      entries.push({
        url: `${SITE_URL}/${locale}/produit/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
      });
    }
  }

  return entries;
}
