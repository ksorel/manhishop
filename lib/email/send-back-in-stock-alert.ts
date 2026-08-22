import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/lib/catalogue/types";

interface BackInStockProduct {
  nameFr: string;
  nameEn: string;
  slug: string;
  sizeLabel: string | null;
}

function renderHtml(product: BackInStockProduct, locale: Locale): string {
  const name = locale === "fr" ? product.nameFr : product.nameEn;
  const productLine = product.sizeLabel
    ? locale === "fr"
      ? `${name} (taille ${product.sizeLabel})`
      : `${name} (size ${product.sizeLabel})`
    : name;

  const intro =
    locale === "fr"
      ? `Bonne nouvelle : <strong>${productLine}</strong> est de nouveau disponible sur Manhishop !`
      : `Good news: <strong>${productLine}</strong> is back in stock on Manhishop!`;
  const linkLabel = locale === "fr" ? "Voir le produit" : "View the product";

  return `
    <div>
      <p>${intro}</p>
      <p><a href="${SITE_URL}/${locale}/produit/${product.slug}">${linkLabel}</a></p>
    </div>
  `;
}

/**
 * Best-effort, comme les autres emails transactionnels du site : n'échoue
 * jamais bruyamment (RESEND_API_KEY absente ou erreur Resend).
 */
export async function sendBackInStockEmail(
  to: string,
  product: BackInStockProduct,
  locale: Locale,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY absente — alerte retour en stock non envoyée.");
    return;
  }

  const name = locale === "fr" ? product.nameFr : product.nameEn;
  const subject =
    locale === "fr"
      ? `${name} est de nouveau disponible — Manhishop`
      : `${name} is back in stock — Manhishop`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Manhishop <commandes@manhishopci.com>",
      to,
      subject,
      html: renderHtml(product, locale),
    });
  } catch (error) {
    console.error("Échec de l'envoi de l'alerte retour en stock:", error);
  }
}
