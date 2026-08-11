-- Hiérarchie de catégories : jusqu'à 4 niveaux de sous-catégories sous une
-- catégorie racine (profondeur totale max 5). Le parent est fixé à la
-- création (pas de déplacement d'un sous-arbre) : la vérification de
-- profondeur n'a donc qu'à remonter les ancêtres, pas les descendants.

alter table public.categories
  add column parent_id uuid references public.categories (id) on delete restrict;

create index categories_parent_id_idx on public.categories (parent_id);

create or replace function public.check_category_depth()
returns trigger
language plpgsql
as $$
declare
  depth integer := 1;
  current_parent uuid := new.parent_id;
  visited uuid[] := array[]::uuid[];
begin
  while current_parent is not null loop
    if current_parent = any (visited) then
      raise exception 'category hierarchy cannot contain a cycle';
    end if;
    visited := visited || current_parent;
    depth := depth + 1;
    if depth > 5 then
      raise exception 'category depth exceeds the maximum of 4 subcategory levels';
    end if;
    select parent_id into current_parent from public.categories where id = current_parent;
  end loop;
  return new;
end;
$$;

create trigger categories_check_depth
  before insert or update of parent_id on public.categories
  for each row execute function public.check_category_depth();
