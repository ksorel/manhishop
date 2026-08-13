import { createAdminClient } from "@/lib/supabase/admin";
import { sendLowStockAlertEmail } from "@/lib/email/send-low-stock-alert";

/**
 * Appelée sans session utilisateur (déclenchée par le cron Vercel), donc
 * via le client service-role plutôt que le client cookie habituel des
 * pages admin. Même définition de "rupture de stock" que le tableau de
 * bord (lib/admin/dashboard.ts) : produits actifs à stock <= 0.
 */
export async function checkAndSendLowStockAlert(): Promise<{ sent: boolean; count: number }> {
  const admin = createAdminClient();

  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, name_fr")
    .eq("status", "active")
    .lte("stock", 0);
  if (productsError) throw productsError;

  if (!products || products.length === 0) {
    return { sent: false, count: 0 };
  }

  const { data: admins, error: adminsError } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  if (adminsError) throw adminsError;

  const recipients: string[] = [];
  for (const { id } of admins ?? []) {
    const { data } = await admin.auth.admin.getUserById(id);
    if (data.user?.email) recipients.push(data.user.email);
  }

  await sendLowStockAlertEmail(
    recipients,
    products.map((p) => ({ id: p.id, nameFr: p.name_fr })),
  );

  return { sent: recipients.length > 0, count: products.length };
}
