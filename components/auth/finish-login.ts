import { mergeGuestCart } from "@/lib/cart/actions";
import { readGuestCart, clearGuestCart } from "@/lib/cart/storage";
import type { Locale } from "@/lib/catalogue/types";

/**
 * Fusionne le panier invité (localStorage) dans le panier serveur puis
 * force un rechargement complet — le layout ré-exécute alors auth.getUser()
 * et récupère le panier fusionné côté serveur pour toute l'app.
 */
export async function finishLoginAndRedirect(locale: Locale, redirectPath: string) {
  const entries = readGuestCart();
  if (entries.length > 0) {
    await mergeGuestCart(entries, locale);
    clearGuestCart();
  }
  window.location.href = redirectPath;
}
