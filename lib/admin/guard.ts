import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * À appeler en tête de chaque page (admin) : redirige vers la connexion
 * si non authentifié, vers l'accueil si authentifié mais pas admin.
 */
export async function requireAdmin(locale: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/connexion`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect(`/${locale}`);

  return user;
}
