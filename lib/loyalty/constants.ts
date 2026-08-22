// Aucune dépendance serveur ici (contrairement à queries.ts/actions.ts) —
// ce fichier est importé aussi bien côté client (affichage checkout) que
// côté serveur (webhook, create-order).

/** 1 point = 10 FCFA de réduction (cohérent avec 1 point gagné / 100 FCFA
 * dépensés, soit ~10% de cashback en valeur). */
export const POINTS_TO_FCFA = 10;

/** 1 point gagné par 100 FCFA (hors livraison, après réduction) dépensés. */
export const EARN_RATE_FCFA_PER_POINT = 100;

/** Bonus de parrainage, versé aux deux côtés à la 1ère commande payée du filleul. */
export const REFERRAL_BONUS_POINTS = 100;

/**
 * Points gagnés sur une commande payée — basé sur ce qui a vraiment été
 * payé (sous-total moins réduction promo ET moins la valeur des points
 * déjà dépensés sur cette même commande), jamais sur le sous-total brut.
 * Sans la déduction des points dépensés, un client regagnerait
 * indéfiniment une fraction de points sur un montant qu'il n'a pas
 * réellement payé (bug corrigé le 2026-08-22).
 */
export function computeEarnedPoints(
  subtotal: number,
  discountAmount: number,
  pointsRedeemed: number,
): number {
  return Math.floor(
    (subtotal - discountAmount - pointsRedeemed * POINTS_TO_FCFA) / EARN_RATE_FCFA_PER_POINT,
  );
}
