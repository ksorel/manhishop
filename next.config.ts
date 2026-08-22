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
const supabaseOrigin = supabaseHostname ? `https://${supabaseHostname}` : "";

// CSP appliquée uniquement en production : le mode dev de Next (HMR)
// nécessite 'unsafe-eval' et des websockets locales que la politique de
// prod n'autorise pas — pas la peine de compliquer la CSP pour ça.
// Checkout Paystack : redirection complète (window.location.href), jamais
// d'iframe/script Paystack chargé sur nos pages — pas de directive dédiée
// nécessaire ici.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${supabaseOrigin} https://media.bdroppy.com`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} https://*.sentry.io`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]
  .join("; ")
  .trim();

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: csp }]
    : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
