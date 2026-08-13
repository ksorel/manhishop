-- Permet un 2ème numéro de téléphone dans le pied de page (optionnel —
-- même convention que les autres champs de site_content : vide = masqué
-- côté boutique).
alter table public.site_content
  add column contact_phone_2 text not null default '';
