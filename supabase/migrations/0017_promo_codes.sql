-- Codes promo : réduction en % ou montant fixe, appliquée au sous-total au
-- moment de la commande. Le total reste toujours recalculé côté serveur
-- (lib/orders/create-order.ts) — le client n'envoie jamais qu'un code, pas
-- un montant de réduction.

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  active boolean not null default true,
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;

-- Pas de policy de lecture publique : la validation d'un code passe
-- toujours par le client service-role (createPendingOrder), jamais par une
-- requête directe du navigateur — évite d'exposer la liste des codes.
create policy "promo_codes_admin_all"
  on public.promo_codes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.orders
  add column promo_code_id uuid references public.promo_codes (id) on delete set null,
  add column discount_amount numeric(10, 2) not null default 0 check (discount_amount >= 0);
