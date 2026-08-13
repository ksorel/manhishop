import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";

interface OutOfStockProduct {
  id: string;
  nameFr: string;
}

function renderHtml(products: OutOfStockProduct[]): string {
  const rows = products
    .map(
      (p) =>
        `<li><a href="${SITE_URL}/fr/admin/produits/${p.id}">${p.nameFr}</a></li>`,
    )
    .join("");

  return `
    <div>
      <p>${products.length} produit(s) actif(s) en rupture de stock sur Manhishop :</p>
      <ul>${rows}</ul>
      <p><a href="${SITE_URL}/fr/admin/produits">Voir tous les produits</a></p>
    </div>
  `;
}

/**
 * Best-effort, comme les autres emails transactionnels du site : n'échoue
 * jamais bruyamment (RESEND_API_KEY absente ou erreur Resend) puisque
 * c'est un rappel, pas une action bloquante.
 */
export async function sendLowStockAlertEmail(
  recipients: string[],
  products: OutOfStockProduct[],
): Promise<void> {
  if (recipients.length === 0 || products.length === 0) return;

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY absente — alerte stock non envoyée.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Manhishop <commandes@manhishopci.com>",
      to: recipients,
      subject: `${products.length} produit(s) en rupture de stock — Manhishop`,
      html: renderHtml(products),
    });
  } catch (error) {
    console.error("Échec de l'envoi de l'alerte stock:", error);
  }
}
