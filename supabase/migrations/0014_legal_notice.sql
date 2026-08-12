-- Mentions légales, éditables depuis le back-office (Admin → Contenu →
-- Pied de page), même mécanique que CGV et confidentialité (0013) :
-- champ vide = lien masqué côté boutique.

alter table public.site_content
  add column legal_notice_fr text not null default '',
  add column legal_notice_en text not null default '';

update public.site_content
set
  legal_notice_fr = 'Mentions légales à compléter (raison sociale, forme juridique, siège social, numéro d''immatriculation, directeur de publication, coordonnées de l''hébergeur).',
  legal_notice_en = 'Legal notice to be completed (company name, legal form, registered address, registration number, publisher, host details).'
where id = 1;
