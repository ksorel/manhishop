import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";

interface BackInStockProduct {
  nameFr: string;
  slug: string;
  sizeLabel: string | null;
}

function renderHtml(product: BackInStockProduct): string {
  const productLine = product.sizeLabel
    ? `${product.nameFr} (taille ${product.sizeLabel})`
    : product.nameFr;

  return `
    <div>
      <p>Bonne nouvelle : <strong>${productLine}</strong> est de nouveau disponible sur Manhishop !</p>
      <p><a href="${SITE_URL}/fr/produit/${product.slug}">Voir le produit</a></p>
    </div>
  `;
}

/**
 * Best-effort, comme les autres emails transactionnels du site : n'échoue
 * jamais bruyamment (RESEND_API_KEY absente ou erreur Resend).
 */
export async function sendBackInStockEmail(to: string, product: BackInStockProduct): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY absente — alerte retour en stock non envoyée.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Manhishop <commandes@manhishopci.com>",
      to,
      subject: `${product.nameFr} est de nouveau disponible — Manhishop`,
      html: renderHtml(product),
    });
  } catch (error) {
    console.error("Échec de l'envoi de l'alerte retour en stock:", error);
  }
}
