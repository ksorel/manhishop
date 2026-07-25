-- Phase 4 — Carnet d'adresses géré par le client (Phase 3 ne faisait que
-- créer une adresse par commande via la clé service_role). Le client
-- authentifié peut désormais créer/modifier/supprimer ses propres
-- adresses directement (RLS), comme pour cart_items / wishlist_items.

create policy "addresses_insert_own"
  on public.addresses for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "addresses_update_own"
  on public.addresses for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "addresses_delete_own"
  on public.addresses for delete
  to authenticated
  using (auth.uid() = user_id);
