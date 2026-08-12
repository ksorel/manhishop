import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client anonyme sans session (pas de cookies) — pour les contextes sans
 * utilisateur (sitemap, robots) où seule la lecture publique via RLS est
 * nécessaire, indépendamment du visiteur qui déclenche la requête.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
