-- Fidélité (1 point / 100 FCFA dépensés, échangeable en réduction) et
-- parrainage (parrain + filleul récompensés en points, une seule fois par
-- filleul, à sa première commande payée). Crédité uniquement au paiement
-- confirmé (webhook Paystack), jamais à la création de la commande.

-- Grand livre des points : positif = gagné, négatif = dépensé. Le solde est
-- toujours la somme, jamais une colonne dupliquée (évite toute
-- désynchronisation, même logique que le choix déjà fait pour l'email dans
-- profiles).
create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  points integer not null check (points <> 0),
  reason text not null check (reason in ('purchase', 'redemption', 'referral_bonus')),
  order_id uuid references public.orders (id) on delete set null,
  created_at timestamptz not null default now()
);

create index loyalty_transactions_user_id_idx on public.loyalty_transactions (user_id);

alter table public.loyalty_transactions enable row level security;

create policy "loyalty_transactions_select_own"
  on public.loyalty_transactions for select
  to authenticated
  using (auth.uid() = user_id);
-- Pas de policy d'écriture : uniquement via le client service-role
-- (webhook pour le gain, createPendingOrder pour la dépense), jamais
-- directement depuis le client.

-- Parrainage : qui a invité qui, et si le bonus a déjà été versé (une
-- seule fois, jamais à la re-commande). Le lien de parrainage utilise
-- directement l'id utilisateur comme code (/inscription?ref=<uuid>) — pas
-- de colonne "code court" séparée à générer/dédupliquer pour cette v1.
alter table public.profiles
  add column referred_by uuid references auth.users (id) on delete set null,
  add column referral_rewarded boolean not null default false;

-- Combien de points ont été dépensés sur cette commande (affichage,
-- comme discount_amount pour les codes promo).
alter table public.orders
  add column points_redeemed integer not null default 0 check (points_redeemed >= 0);

-- handle_new_user() (migration 0002) : capte referred_by depuis les
-- métadonnées d'inscription, avec validation défensive (UUID valide,
-- existe, pas d'auto-parrainage).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ref_id uuid;
begin
  begin
    ref_id := (new.raw_user_meta_data ->> 'referred_by')::uuid;
  exception when others then
    ref_id := null;
  end;

  if ref_id is not null and ref_id = new.id then
    ref_id := null;
  end if;
  if ref_id is not null and not exists (select 1 from auth.users where id = ref_id) then
    ref_id := null;
  end if;

  insert into public.profiles (id, full_name, phone, referred_by)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    ref_id
  );
  return new;
end;
$$;
