import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  // Le badge de statut du mode dev (coin de l'écran) intercepte les
  // clics Playwright sur petit viewport (mobile-chrome) — désactivé,
  // purement cosmétique et sans effet en production.
  devIndicators: false,
  experimental: {
    // Défaut Next (1 Mo) trop bas pour l'upload de CV en PDF via Server
    // Action (submitJobApplication) — le code applique déjà sa propre
    // limite à 5 Mo (message d'erreur convivial). Marge volontairement
    // large au-dessus de cette limite applicative (10 Mo) pour que ce soit
    // toujours notre validation — pas le plafond bas niveau de Next — qui
    // déclenche en premier et affiche le message convivial.
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
        : []),
      // Images hotlinkées de l'import de catalogue fournisseur (bdroppy.com) —
      // pas de re-upload vers Supabase Storage (quota gratuit insuffisant).
      { protocol: "https" as const, hostname: "media.bdroppy.com" },
    ],
  },
};

export default withSentryConfig(withSerwist(withNextIntl(nextConfig)), {
  // org/project/authToken absents tant que le compte Sentry n'est pas
  // configuré : l'upload des source maps est alors simplement ignoré
  // (build inchangé), les stack traces restent juste minifiées.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  webpack: { treeshake: { removeDebugLogging: true } },
});
