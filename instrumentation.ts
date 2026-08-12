import * as Sentry from "@sentry/nextjs";

// DSN absent (avant que le compte Sentry ne soit créé/configuré) : Sentry
// reste silencieusement inactif plutôt que d'échouer — même principe que
// RESEND_API_KEY absente (voir lib/email/send-order-confirmation.ts).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.2,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
