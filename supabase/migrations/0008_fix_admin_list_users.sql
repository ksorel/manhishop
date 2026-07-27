-- Corrige admin_list_users() : auth.users.email est un varchar(255),
-- pas un text — Postgres refuse le RETURN QUERY sans cast explicite
-- ("structure of query does not match function result type").

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
    select u.id, u.email::text, p.full_name, p.role, p.created_at
    from auth.users u
    join public.profiles p on p.id = u.id
    order by p.created_at desc;
end;
$$;
