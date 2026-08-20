import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { NextFetchEvent, NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const VISITOR_COOKIE = "mh_vid";
// Pas une vraie session glissante : le cookie n'est pas rafraîchi à chaque
// requête, seulement posé une fois. Un même visiteur qui revient après ce
// délai est recompté — approximation volontairement simple pour "visiteurs
// récents", pas un suivi précis par personne.
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24;
const ADMIN_PATH_PATTERN = /^\/(fr|en)\/admin(\/|$)/;

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const response = intlMiddleware(request);

  // Rafraîchit la session Supabase (cookies) sur la réponse produite par
  // next-intl, pour que l'utilisateur reste connecté sur toutes les routes.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  // Compteur de visiteurs pour le tableau de bord admin (taux de
  // conversion) : un seul enregistrement par visiteur unique (cookie),
  // jamais par page vue — et jamais pour les visites de l'admin
  // lui-même, qui fausseraient les chiffres. Best-effort via waitUntil :
  // ne bloque jamais le rendu de la page si l'insert échoue ou traîne.
  const pathname = request.nextUrl.pathname;
  if (!ADMIN_PATH_PATTERN.test(pathname) && !request.cookies.get(VISITOR_COOKIE)) {
    const sessionId = crypto.randomUUID();
    response.cookies.set(VISITOR_COOKIE, sessionId, {
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    event.waitUntil(
      (async () => {
        try {
          await supabase.from("page_visits").insert({ session_id: sessionId });
        } catch {
          // Best-effort — ne doit jamais impacter la navigation.
        }
      })(),
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
