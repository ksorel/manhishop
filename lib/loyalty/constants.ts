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
