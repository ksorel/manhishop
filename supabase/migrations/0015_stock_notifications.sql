-- "Prévenez-moi quand disponible" : un client s'abonne à un produit (ou une
-- taille précise) en rupture, notifié par email dès qu'il redevient
-- disponible (voir lib/stock-notifications/notify.ts).

create table public.stock_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  size_id uuid references public.product_sizes (id) on delete cascade,
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

-- Un seul abonnement actif par utilisateur/produit/taille (size_id nullable
-- pour un produit sans taille) — même motif que
-- cart_items_cart_product_size_key (migration 0012).
create unique index stock_notifications_user_product_size_key
  on public.stock_notifications (user_id, product_id, (coalesce(size_id, '00000000-0000-0000-0000-000000000000'::uuid)));

alter table public.stock_notifications enable row level security;

create policy "stock_notifications_own"
  on public.stock_notifications for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
