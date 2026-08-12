import * as Sentry from "@sentry/nextjs";

// Un DSN Sentry n'est pas un secret (il ne permet que d'envoyer des
// événements, pas d'en lire) — d'où le préfixe NEXT_PUBLIC_, exposé au
// navigateur sans risque. Absent : Sentry reste inactif côté client.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
