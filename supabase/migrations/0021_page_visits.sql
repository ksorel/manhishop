-- Compteur de visiteurs léger pour le tableau de bord admin (taux de
-- conversion visiteurs → commandes). Aucune donnée personnelle : juste un
-- identifiant anonyme (cookie côté middleware, voir proxy.ts) et un
-- horodatage — un seul enregistrement par visiteur unique (pas une ligne
-- par page vue).
create table public.page_visits (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  created_at timestamptz not null default now()
);

create index page_visits_created_at_idx on public.page_visits (created_at);

alter table public.page_visits enable row level security;

-- Écriture ouverte : aucune donnée sensible, un visiteur anonyme (avec ou
-- sans compte) doit pouvoir être compté depuis le middleware (clé anon).
create policy "page_visits_insert_public"
  on public.page_visits for insert
  to public
  with check (true);

create policy "page_visits_admin_select"
  on public.page_visits for select
  to authenticated
  using (public.is_admin());
