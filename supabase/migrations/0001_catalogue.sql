-- Phase 1 — Catalogue : catégories, produits, images.
-- Lecture publique uniquement (RLS). Aucune policy d'écriture n'est
-- définie : les écritures passent par la clé service_role (routes API /
-- back-office Phase 5), jamais directement depuis le client.

create extension if not exists pgcrypto;

-- Catégories -----------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  image text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

-- Produits ---------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  description_fr text not null default '',
  description_en text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  promo_price numeric(10, 2) check (promo_price is null or promo_price >= 0),
  category_id uuid references public.categories (id) on delete set null,
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'draft' check (status in ('active', 'draft')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_status_idx on public.products (status);
create index products_featured_idx on public.products (featured) where featured;

alter table public.products enable row level security;

create policy "products_public_read_active"
  on public.products for select
  to anon, authenticated
  using (status = 'active');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Recherche plein texte (fr + en), utilisée par la page /recherche -------

alter table public.products
  add column search_fr tsvector generated always as (
    setweight(to_tsvector('french', coalesce(name_fr, '')), 'A')
    || setweight(to_tsvector('french', coalesce(description_fr, '')), 'B')
  ) stored,
  add column search_en tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name_en, '')), 'A')
    || setweight(to_tsvector('english', coalesce(description_en, '')), 'B')
  ) stored;

create index products_search_fr_idx on public.products using gin (search_fr);
create index products_search_en_idx on public.products using gin (search_en);

-- Images produit -----------------------------------------------------------

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  display_order integer not null default 0
);

create index product_images_product_id_idx on public.product_images (product_id);

alter table public.product_images enable row level security;

create policy "product_images_public_read"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = product_images.product_id
        and products.status = 'active'
    )
  );
