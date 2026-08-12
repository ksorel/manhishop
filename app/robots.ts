import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

// Pages sans intérêt SEO (privées, spécifiques à un utilisateur, ou
// derrière connexion) — exclues du crawl pour ne pas gaspiller le budget
// d'exploration des moteurs de recherche sur du contenu non indexable.
const PRIVATE_PATHS = ["/admin", "/checkout", "/panier", "/compte", "/commandes", "/favoris"];

export default function robots(): MetadataRoute.Robots {
  const disallow = routing.locales.flatMap((locale) =>
    PRIVATE_PATHS.map((path) => `/${locale}${path}`),
  );
  disallow.push("/api");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
