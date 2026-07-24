-- Phase 2 — Panier persistant (utilisateurs connectés) et wishlist.
-- Le panier invité vit côté client (localStorage) et est fusionné dans
-- ces tables à la connexion (voir lib/cart/actions.ts).

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.carts enable row level security;

create policy "carts_own"
  on public.carts for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create index cart_items_cart_id_idx on public.cart_items (cart_id);

alter table public.cart_items enable row level security;

create policy "cart_items_own"
  on public.cart_items for all
  to authenticated
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
    )
  );

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlist_items enable row level security;

create policy "wishlist_items_own"
  on public.wishlist_items for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
