import type { Locale } from "@/lib/catalogue/types";

/**
 * Franc CFA (XOF) — marché cible Afrique de l'Ouest francophone
 * (voir manhishop-spec.md section 2.1). Pas de décimales (usage courant).
 */
export function formatPrice(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}
