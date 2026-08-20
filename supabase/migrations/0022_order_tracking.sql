-- Info de suivi (numéro de suivi ou note libre) saisie par l'admin,
-- affichée au client sur sa page de commande. Texte libre, pas un format
-- imposé (livraison locale, pas forcément un vrai transporteur avec API).
alter table public.orders
  add column tracking_info text;
