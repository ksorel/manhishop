"use server";

import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/catalogue/types";

export async function subscribeToStockNotification(
  productId: string,
  sizeId: string | null,
  locale: Locale,
): Promise<{ status: "unauthenticated" } | { status: "ok" }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "unauthenticated" };

  let existingQuery = supabase
    .from("stock_notifications")
    .select("id, notified_at")
    .eq("user_id", user.id)
    .eq("product_id", productId);
  existingQuery = sizeId ? existingQuery.eq("size_id", sizeId) : existingQuery.is("size_id", null);
  const { data: existing } = await existingQuery.maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from("stock_notifications")
      .insert({ user_id: user.id, product_id: productId, size_id: sizeId, locale });
    if (error) throw error;
  } else if (existing.notified_at !== null) {
    // Déjà notifié une première fois : on réarme l'abonnement plutôt que
    // de le laisser silencieusement mort — sinon un client qui reclique
    // "Prévenez-moi" après une alerte précédente ne serait jamais
    // recontacté, malgré un message de succès affiché à l'écran.
    const { error } = await supabase
      .from("stock_notifications")
      .update({ notified_at: null, locale })
      .eq("id", existing.id);
    if (error) throw error;
  }
  // Sinon (existant, jamais encore notifié) : abonnement déjà actif, rien à faire.

  return { status: "ok" };
}
