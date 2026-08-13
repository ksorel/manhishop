import { Resend } from "resend";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";
import type { PreparedOrder } from "@/lib/orders/types";

const SUBJECT: Record<Locale, string> = {
  fr: "Confirmation de votre commande Manhishop",
  en: "Your Manhishop order confirmation",
};

function renderHtml(order: PreparedOrder, locale: Locale) {
  const rows = order.lines
    .map((line) => {
      const label = line.sizeLabel ? `${line.name} (${line.sizeLabel})` : line.name;
      return `<tr><td>${label} × ${line.quantity}</td><td style="text-align:right">${formatPrice(line.unitPrice * line.quantity, locale)}</td></tr>`;
    })
    .join("");

  const deliveryLabel = locale === "fr" ? "Livraison" : "Delivery";
  const discountLabel = locale === "fr" ? "Réduction" : "Discount";
  const totalLabel = locale === "fr" ? "Total" : "Total";
  const thanks =
    locale === "fr"
      ? "Merci pour votre commande sur Manhishop !"
      : "Thank you for your order on Manhishop!";

  const discountRow =
    order.discountAmount > 0
      ? `<tr><td>${discountLabel}</td><td style="text-align:right">-${formatPrice(order.discountAmount, locale)}</td></tr>`
      : "";

  return `
    <div>
      <p>${thanks}</p>
      <table style="width:100%;border-collapse:collapse">
        ${rows}
        <tr><td>${deliveryLabel}</td><td style="text-align:right">${formatPrice(order.deliveryFee, locale)}</td></tr>
        ${discountRow}
        <tr><td><strong>${totalLabel}</strong></td><td style="text-align:right"><strong>${formatPrice(order.total, locale)}</strong></td></tr>
      </table>
    </div>
  `;
}

/**
 * Best-effort : n'échoue jamais bruyamment le webhook de paiement si
 * l'email ne part pas (RESEND_API_KEY absente ou erreur Resend).
 */
export async function sendOrderConfirmationEmail(order: PreparedOrder, locale: Locale) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY absente — email de confirmation non envoyé.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Manhishop <commandes@manhishopci.com>",
      to: order.contactEmail,
      subject: SUBJECT[locale],
      html: renderHtml(order, locale),
    });
  } catch (error) {
    console.error("Échec de l'envoi de l'email de confirmation:", error);
  }
}
