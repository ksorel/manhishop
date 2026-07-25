-- Phase 3 — Commandes & paiement.
-- Aucune policy d'écriture pour anon/authenticated : une commande est
-- toujours créée par une route API serveur (clé service_role), jamais
-- directement par le client, pour garantir que le total est recalculé
-- côté serveur (jamais confiance dans un prix envoyé par le client).
--
-- Les invités (sans compte) doivent pouvoir consulter leur page de
-- confirmation : chaque commande a un access_token opaque utilisé pour
-- ce cas précis (lookup via la clé service_role dans une route API,
-- jamais exposé via une policy RLS générale).

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  country text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.addresses enable row level security;

create policy "addresses_select_own"
  on public.addresses for select
  to authenticated
  using (auth.uid() = user_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  access_token uuid not null default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  contact_email text not null,
  contact_phone text not null,
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  shipping_address_id uuid references public.addresses (id) on delete set null,
  -- Le canal (carte / mobile money) est choisi par le client sur la page
  -- Paystack elle-même, pas dans notre UI : connu seulement après
  -- paiement, donc rempli par le webhook, pas à la création.
  payment_method text check (payment_method in ('card', 'mobile_money')),
  payment_provider text check (payment_provider in ('paystack')),
  external_transaction_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "order_items_select_own"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- Idempotence du webhook Paystack : un même événement de confirmation
-- rejoué ne doit jamais créer de doublon / re-traiter un paiement déjà
-- appliqué.
create table public.processed_webhook_events (
  id text primary key,
  provider text not null check (provider in ('paystack')),
  created_at timestamptz not null default now()
);

alter table public.processed_webhook_events enable row level security;
-- Aucune policy : cette table n'est lue/écrite que par la clé service_role.
