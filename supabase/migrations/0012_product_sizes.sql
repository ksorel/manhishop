-- Variantes de taille par produit (vêtements, chaussures, ...) avec stock
-- dédié par taille, et guides des tailles éditables depuis le back-office.
-- Un produit sans ligne dans product_sizes reste un produit simple (son
-- stock au niveau `products.stock` fait foi, comme avant) ; dès qu'il a au
-- moins une taille, la sélection d'une taille devient obligatoire à
-- l'achat et le stock se suit par taille.

create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  stock integer not null default 0 check (stock >= 0),
  display_order integer not null default 0,
  unique (product_id, label)
);

create index product_sizes_product_id_idx on public.product_sizes (product_id);

alter table public.product_sizes enable row level security;

create policy "product_sizes_public_read"
  on public.product_sizes for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products
      where products.id = product_sizes.product_id
        and products.status = 'active'
    )
  );

create policy "product_sizes_admin_write"
  on public.product_sizes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Guides des tailles ------------------------------------------------------
-- Contenu stocké en jsonb : { "headers": [{"fr":"Taille","en":"Size"}, ...],
-- "rows": [["S","80-84"], ["M","85-89"], ...] } — édité comme une grille
-- simple depuis l'admin, sans schéma de colonnes figé (vêtements,
-- chaussures et futurs types de produits n'ont pas les mêmes colonnes).

create table public.size_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fr text not null,
  title_en text not null,
  display_order integer not null default 0,
  content jsonb not null default '{"headers":[],"rows":[]}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.size_guides enable row level security;

create policy "size_guides_public_read"
  on public.size_guides for select
  to anon, authenticated
  using (true);

create policy "size_guides_admin_write"
  on public.size_guides for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.products
  add column size_guide_id uuid references public.size_guides (id) on delete set null;

-- Panier : une taille par produit dans le panier (le même produit peut
-- apparaître en plusieurs lignes, une par taille choisie).
alter table public.cart_items
  add column size_id uuid references public.product_sizes (id) on delete cascade;

alter table public.cart_items
  drop constraint cart_items_cart_id_product_id_key;

create unique index cart_items_cart_product_size_key
  on public.cart_items (cart_id, product_id, (coalesce(size_id, '00000000-0000-0000-0000-000000000000'::uuid)));

-- Commandes : la taille achetée est figée au moment de la commande (comme
-- product_name), indépendamment d'une modification/suppression ultérieure
-- de la taille côté catalogue.
alter table public.order_items
  add column size_label text;
