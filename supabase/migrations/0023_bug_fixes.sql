-- Corrections suite à l'audit du 2026-08-21 :
-- 1) size_id sur order_items (nécessaire pour restituer le bon stock à
--    l'annulation d'une commande sur un produit à tailles — le label seul
--    ne suffit pas). Reste `on delete set null`, jamais cascade : le
--    principe déjà en place (migration 0012) de figer la commande
--    indépendamment d'une suppression ultérieure de la taille est
--    préservé, size_id est un plus, pas un remplacement de size_label.
--    Limite assumée : les commandes déjà existantes avant cette migration
--    auront size_id = null même si elles portaient une taille — leur
--    annulation restituera au produit simple plutôt qu'à la bonne taille
--    (cas résiduel, à ajuster manuellement si besoin).
alter table public.order_items
  add column size_id uuid references public.product_sizes (id) on delete set null;

-- 2) Fonction unique pour décrémenter (achat) ou recréditer (annulation)
--    le stock de façon atomique — jamais de lecture-puis-écriture côté
--    application, qui serait sujette à une race condition. Verrouillée au
--    rôle service_role uniquement (jamais anon/authenticated), puisqu'elle
--    n'est appelée que depuis le webhook Paystack et l'annulation admin,
--    tous deux déjà côté serveur.
create or replace function public.apply_stock_delta(
  p_product_id uuid,
  p_size_id uuid,
  p_delta integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_size_id is not null then
    update public.product_sizes set stock = greatest(stock + p_delta, 0) where id = p_size_id;
  else
    update public.products set stock = greatest(stock + p_delta, 0) where id = p_product_id;
  end if;
end;
$$;

revoke all on function public.apply_stock_delta(uuid, uuid, integer) from public;
grant execute on function public.apply_stock_delta(uuid, uuid, integer) to service_role;

-- 3) Nouveau motif pour reprendre (à l'annulation) les points gagnés,
--    dépensés ou de parrainage déjà crédités sur une commande.
alter table public.loyalty_transactions
  drop constraint loyalty_transactions_reason_check;

alter table public.loyalty_transactions
  add constraint loyalty_transactions_reason_check
  check (reason in ('purchase', 'redemption', 'referral_bonus', 'cancellation_reversal'));

-- 4) Langue du client au moment de l'abonnement "prévenez-moi", pour que
--    l'email de retour en stock soit dans la bonne langue (comme
--    orders.locale pour la confirmation de commande) plutôt que toujours
--    en français.
alter table public.stock_notifications
  add column locale text not null default 'fr' check (locale in ('fr', 'en'));
