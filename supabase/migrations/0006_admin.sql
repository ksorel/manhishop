-- Phase 5 — Back-office admin.
-- Fonction utilitaire pour gater les policies RLS d'écriture sur le
-- rôle admin (security definer : contourne RLS sur profiles pour
-- éviter la récursion, comme documenté par Supabase).

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Catalogue : lecture publique déjà en place (Phase 1), on ajoute
-- l'écriture réservée aux admins.
create policy "categories_admin_write"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_admin_write"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_images_admin_write"
  on public.product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Commandes : un admin peut tout voir et changer le statut (expédiée,
-- livrée, annulée) ; le statut pending → paid reste réservé au webhook
-- de paiement (clé service_role, RLS non concernée).
create policy "orders_admin_all"
  on public.orders for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items_admin_all"
  on public.order_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "addresses_admin_select"
  on public.addresses for select
  to authenticated
  using (public.is_admin());

-- Stockage des images produit (upload depuis le back-office).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_bucket_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_bucket_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_bucket_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
