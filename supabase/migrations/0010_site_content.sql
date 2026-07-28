-- Contenu de la page d'accueil éditable depuis le back-office
-- (/admin/contenu), pour que le responsable puisse changer le titre
-- et le sous-titre de la bannière sans intervention technique.
-- Ligne unique (singleton) : id figé à 1.

create table public.site_content (
  id smallint primary key default 1 check (id = 1),
  hero_title_fr text not null,
  hero_title_en text not null,
  hero_subtitle_fr text not null,
  hero_subtitle_en text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Lecture publique : affiché sur la page d'accueil pour tout visiteur.
create policy "site_content_public_read"
  on public.site_content for select
  to anon, authenticated
  using (true);

create policy "site_content_admin_write"
  on public.site_content for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_content (id, hero_title_fr, hero_title_en, hero_subtitle_fr, hero_subtitle_en)
values (
  1,
  'Bienvenue chez Manhishop',
  'Welcome to Manhishop',
  'Des produits authentiques, livrés près de chez vous.',
  'Authentic products, delivered near you.'
);
