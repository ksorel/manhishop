-- Contenu du pied de page, éditable depuis l'admin (/admin/contenu) :
-- contact, réseaux sociaux, CGV, politique de confidentialité. Chaque
-- champ est optionnel — vide côté admin = masqué côté boutique (voir
-- lib/content/queries.ts). Valeurs de départ ci-dessous à remplacer par
-- les vraies coordonnées du client.

alter table public.site_content
  add column contact_email text not null default '',
  add column contact_phone text not null default '',
  add column social_instagram text not null default '',
  add column social_facebook text not null default '',
  add column social_tiktok text not null default '',
  add column social_whatsapp text not null default '',
  add column cgv_fr text not null default '',
  add column cgv_en text not null default '',
  add column privacy_policy_fr text not null default '',
  add column privacy_policy_en text not null default '';

update public.site_content
set
  contact_email = 'contact@manhishopci.com',
  contact_phone = '+225 00 00 00 00',
  social_instagram = 'https://instagram.com/manhishop',
  social_facebook = 'https://facebook.com/manhishop',
  social_tiktok = 'https://tiktok.com/@manhishop',
  social_whatsapp = 'https://wa.me/2250000000000',
  cgv_fr = 'Conditions générales de vente à compléter.',
  cgv_en = 'Terms of sale to be completed.',
  privacy_policy_fr = 'Politique de confidentialité à compléter.',
  privacy_policy_en = 'Privacy policy to be completed.'
where id = 1;
