import { createAdminClient } from "@/lib/supabase/admin";
import { sendBackInStockEmail } from "@/lib/email/send-back-in-stock-alert";

interface NotifyParams {
  productId: string;
  nameFr: string;
  slug: string;
  simpleStock: number;
  sizes: { id: string; label: string; stock: number }[];
}

interface NotifyTarget {
  sizeId: string | null;
  sizeLabel: string | null;
}

/**
 * Appelée après la sauvegarde d'un produit (updateProduct) avec le client
 * service-role : il faut lire l'email d'autres utilisateurs pour les
 * prévenir, ce qu'une session admin classique (RLS) ne permet pas.
 */
export async function notifyBackInStockIfNeeded(params: NotifyParams): Promise<void> {
  const targets: NotifyTarget[] =
    params.sizes.length === 0
      ? params.simpleStock > 0
        ? [{ sizeId: null, sizeLabel: null }]
        : []
      : params.sizes
          .filter((size) => size.stock > 0)
          .map((size) => ({ sizeId: size.id, sizeLabel: size.label }));

  if (targets.length === 0) return;

  const admin = createAdminClient();

  for (const target of targets) {
    let query = admin
      .from("stock_notifications")
      .select("id, user_id")
      .eq("product_id", params.productId)
      .is("notified_at", null);
    query = target.sizeId ? query.eq("size_id", target.sizeId) : query.is("size_id", null);

    const { data: pending } = await query;

    for (const subscription of pending ?? []) {
      const { data } = await admin.auth.admin.getUserById(subscription.user_id);
      if (data.user?.email) {
        await sendBackInStockEmail(data.user.email, {
          nameFr: params.nameFr,
          slug: params.slug,
          sizeLabel: target.sizeLabel,
        });
      }
      await admin
        .from("stock_notifications")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", subscription.id);
    }
  }
}
