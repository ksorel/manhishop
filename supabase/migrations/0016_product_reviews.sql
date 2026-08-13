-- Avis produits : seul un client ayant effectivement acheté le produit
-- (commande payée/expédiée/livrée) peut laisser un avis. Pas de modération
-- a priori — visible immédiatement, supprimable après coup depuis l'admin.

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  -- Snapshot du nom plutôt qu'une jointure sur profiles : la policy
  -- profiles_select_own (migration 0002) empêche de lire le profil d'un
  -- autre utilisateur — même logique que order_items.product_name.
  author_name text not null,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

alter table public.product_reviews enable row level security;

create policy "product_reviews_public_read"
  on public.product_reviews for select
  to anon, authenticated
  using (true);

create policy "product_reviews_insert_verified_purchase"
  on public.product_reviews for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.order_items
      join public.orders on orders.id = order_items.order_id
      where order_items.product_id = product_reviews.product_id
        and orders.user_id = auth.uid()
        and orders.status in ('paid', 'shipped', 'delivered')
    )
  );

create policy "product_reviews_update_own"
  on public.product_reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "product_reviews_delete_own"
  on public.product_reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- Deux policies DELETE permissives se combinent en OR : le propriétaire
-- ou un admin peuvent supprimer un avis.
create policy "product_reviews_admin_delete"
  on public.product_reviews for delete
  to authenticated
  using (public.is_admin());
