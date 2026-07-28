begin;

-- A user can belong to more than one storefront while profiles.store_id
-- remains the legacy/default store for applications that do not select one.
create table if not exists public.store_memberships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  role public.admin_role not null default 'attendant',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, store_id)
);

create index if not exists store_memberships_store_active_role_idx
  on public.store_memberships (store_id, active, role);

insert into public.store_memberships (user_id, store_id, role, active)
select id, store_id, role, active
from public.profiles
on conflict (user_id, store_id) do update
set
  role = excluded.role,
  active = excluded.active,
  updated_at = now();

alter table public.store_memberships enable row level security;
revoke all on public.store_memberships from anon, authenticated;
grant select on public.store_memberships to authenticated;
grant insert, update, delete on public.store_memberships to authenticated;

create or replace function private.requested_store_id()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  headers jsonb;
  raw_store_id text;
begin
  headers := nullif(current_setting('request.headers', true), '')::jsonb;
  raw_store_id := headers ->> 'x-store-id';
  if raw_store_id is null
    or raw_store_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    return null;
  end if;
  return raw_store_id::uuid;
exception
  when others then
    return null;
end;
$$;

create or replace function private.current_user_store_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select membership.store_id
      from public.store_memberships as membership
      where membership.user_id = (select auth.uid())
        and membership.active = true
        and membership.store_id = private.requested_store_id()
      limit 1
    ),
    (
      select profile.store_id
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.active = true
      limit 1
    )
  );
$$;

create or replace function private.has_store_role(
  target_store_id uuid,
  allowed_roles public.admin_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_store_id is not null and (
    exists (
      select 1
      from public.store_memberships as membership
      where membership.user_id = (select auth.uid())
        and membership.store_id = target_store_id
        and membership.active = true
        and membership.role = any(allowed_roles)
    )
    or exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.store_id = target_store_id
        and profile.active = true
        and profile.role = any(allowed_roles)
    )
  );
$$;

create or replace function private.has_any_role(
  allowed_roles public.admin_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_store_role(
    private.current_user_store_id(),
    allowed_roles
  );
$$;

create or replace function private.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_any_role(
    array['admin', 'editor', 'attendant']::public.admin_role[]
  );
$$;

revoke all on function private.requested_store_id()
  from public, anon, authenticated;
revoke all on function private.current_user_store_id()
  from public, anon, authenticated;
revoke all on function private.has_store_role(uuid, public.admin_role[])
  from public, anon, authenticated;
revoke all on function private.has_any_role(public.admin_role[])
  from public, anon, authenticated;
revoke all on function private.is_active_staff()
  from public, anon, authenticated;

grant execute on function private.current_user_store_id() to authenticated;
grant execute on function private.has_store_role(uuid, public.admin_role[])
  to authenticated;
grant execute on function private.has_any_role(public.admin_role[])
  to authenticated;
grant execute on function private.is_active_staff() to authenticated;

drop policy if exists "users read own memberships"
  on public.store_memberships;
create policy "users read own memberships"
on public.store_memberships for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "store admins insert memberships"
  on public.store_memberships;
create policy "store admins insert memberships"
on public.store_memberships for insert to authenticated
with check (
  private.has_store_role(
    store_id,
    array['admin']::public.admin_role[]
  )
);

drop policy if exists "store admins update memberships"
  on public.store_memberships;
create policy "store admins update memberships"
on public.store_memberships for update to authenticated
using (
  private.has_store_role(
    store_id,
    array['admin']::public.admin_role[]
  )
)
with check (
  private.has_store_role(
    store_id,
    array['admin']::public.admin_role[]
  )
);

drop policy if exists "store admins delete memberships"
  on public.store_memberships;
create policy "store admins delete memberships"
on public.store_memberships for delete to authenticated
using (
  private.has_store_role(
    store_id,
    array['admin']::public.admin_role[]
  )
);

comment on table public.store_memberships is
  'Per-store staff access. profiles.store_id remains the legacy/default store.';
comment on function private.requested_store_id() is
  'Reads x-store-id from PostgREST request headers; never trusts it without an active membership.';

commit;
