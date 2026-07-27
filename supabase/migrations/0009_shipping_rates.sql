-- Grille tarifaire de livraison, gérable depuis le back-office (plus de
-- tarif fixe codé en dur). Une ligne avec city = null est le tarif par
-- défaut du pays ; une ligne avec city renseignée surclasse ce défaut
-- pour cette ville précise (ex. Abidjan moins cher que le reste de la
-- Côte d'Ivoire).

create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  city text,
  fee numeric(10, 2) not null check (fee >= 0),
  created_at timestamptz not null default now(),
  unique (country, city)
);

create index shipping_rates_country_idx on public.shipping_rates (country);

alter table public.shipping_rates enable row level security;

-- Lecture publique : le checkout (invité ou connecté) doit pouvoir
-- afficher le bon tarif avant paiement.
create policy "shipping_rates_public_read"
  on public.shipping_rates for select
  to anon, authenticated
  using (true);

create policy "shipping_rates_admin_write"
  on public.shipping_rates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Données de départ — à ajuster librement depuis /admin/livraison.
insert into public.shipping_rates (country, city, fee) values
  ('ci', 'Abidjan', 1000),
  ('ci', null, 2000),
  ('sn', null, 5000),
  ('ml', null, 5000),
  ('bf', null, 5000),
  ('tg', null, 5000),
  ('bj', null, 5000);
