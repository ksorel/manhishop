-- Phase 5 (suite) — Gestion des accès admin depuis le back-office.
-- auth.users n'est pas exposée via PostgREST : on passe par des
-- fonctions security definer, qui vérifient elles-mêmes is_admin() en
-- interne (défense en profondeur, même si appelées directement en RPC).

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
    select u.id, u.email, p.full_name, p.role, p.created_at
    from auth.users u
    join public.profiles p on p.id = u.id
    order by p.created_at desc;
end;
$$;

create or replace function public.admin_set_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if new_role not in ('customer', 'admin') then
    raise exception 'invalid role';
  end if;

  update public.profiles set role = new_role where id = target_user_id;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
