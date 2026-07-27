begin;

-- Deterministic ids make the backfill, application fallback and rollback auditable.
-- Vision keeps every existing row. Helena starts with categories only.
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  logo_url text,
  instagram_url text,
  whatsapp_number text,
  whatsapp_default_message text,
  currency text not null default 'BRL',
  locale text not null default 'pt-BR',
  show_prices boolean not null default true,
  active boolean not null default true,
  domains text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stores_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint stores_name_not_blank check (btrim(name) <> ''),
  constraint stores_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint stores_whatsapp_length check (
    whatsapp_number is null or char_length(whatsapp_number) between 8 and 20
  ),
  constraint stores_whatsapp_message_length check (
    whatsapp_default_message is null
    or char_length(whatsapp_default_message) <= 1200
  )
);

insert into public.stores (
  id, slug, name, instagram_url, currency, locale, show_prices, active
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'otica-vision',
    'Ótica Vision',
    null,
    'BRL',
    'pt-BR',
    true,
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'helena-joias',
    'Helena Joias',
    'https://www.instagram.com/helenaajoias/',
    'BRL',
    'pt-BR',
    true,
    true
  )
on conflict (id) do nothing;

create index if not exists stores_active_slug_idx
  on public.stores (active, slug);

-- Existing users remain assigned to Vision. A Helena user must be provisioned
-- explicitly with the Helena store id before being activated.
alter table public.profiles
  add column if not exists store_id uuid not null
  default '11111111-1111-4111-8111-111111111111'
  references public.stores (id) on delete restrict;
create index if not exists profiles_store_active_idx
  on public.profiles (store_id, active, role);

-- Every commercial/content table receives a required store context.
alter table public.brands
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.categories
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.products
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.product_images
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.product_image_variants
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.product_image_uploads
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.styles
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.product_styles
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.collections
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.collection_products
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.collection_publications
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.collection_publication_products
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.galleries
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.gallery_items
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.gallery_publications
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.gallery_publication_items
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.promotions
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.promotion_products
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.analytics_events
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.site_settings
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.analytics_daily_summary
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.analytics_product_daily
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.analytics_style_daily
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;
alter table public.analytics_conversion_daily
  add column if not exists store_id uuid not null default '11111111-1111-4111-8111-111111111111' references public.stores (id) on delete restrict;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'brands', 'categories', 'products', 'product_images',
    'product_image_variants', 'product_image_uploads', 'styles',
    'product_styles', 'collections', 'collection_products',
    'collection_publications', 'collection_publication_products',
    'galleries', 'gallery_items', 'gallery_publications',
    'gallery_publication_items', 'promotions', 'promotion_products',
    'analytics_events', 'site_settings', 'analytics_daily_summary',
    'analytics_product_daily', 'analytics_style_daily',
    'analytics_conversion_daily'
  ]
  loop
    execute format(
      'create index if not exists %I on public.%I (store_id)',
      target_table || '_store_id_idx',
      target_table
    );
  end loop;
end
$$;

-- Helena fields are additive. Legacy Vision columns remain intact.
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'product_status'
  ) then
    create type public.product_status as enum (
      'draft', 'active', 'sold_out', 'archived'
    );
  end if;
end
$$;

alter table public.categories
  add column if not exists description text,
  add column if not exists icon_key text,
  add column if not exists cover_image_url text,
  add column if not exists sort_order integer not null default 0;
alter table public.categories
  drop constraint if exists categories_icon_key_allowed;
alter table public.categories
  add constraint categories_icon_key_allowed check (
    icon_key is null
    or icon_key in ('necklaces', 'earrings', 'bracelets', 'rings', 'sets')
  );

alter table public.products
  add column if not exists description text,
  add column if not exists compare_at_price numeric(12, 2),
  add column if not exists status public.product_status not null default 'draft',
  add column if not exists new_arrival boolean not null default false,
  add column if not exists sort_order integer not null default 0;
alter table public.products alter column sku drop not null;
alter table public.products
  drop constraint if exists products_compare_at_price_positive;
alter table public.products
  add constraint products_compare_at_price_positive check (
    compare_at_price is null or compare_at_price > 0
  );

alter table public.product_images
  add column if not exists image_url text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_primary boolean not null default false;

alter table public.analytics_events
  add column if not exists session_id text,
  add column if not exists category_id uuid references public.categories (id) on delete set null,
  add column if not exists referrer text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text;
set local session_replication_role = replica;
update public.analytics_events
set
  session_id = coalesce(anonymous_session_id::text, 'legacy-' || id::text),
  referrer = coalesce(referrer, referrer_domain)
where session_id is null or referrer is null;
set local session_replication_role = origin;
alter table public.analytics_events alter column session_id set not null;

-- Keep status/order aliases compatible in both applications.
create or replace function private.sync_multistore_product_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
    or new.status is distinct from old.status then
    case new.status
      when 'draft' then
        new.published := false;
        new.archived_at := null;
      when 'active' then
        new.published := true;
        new.archived_at := null;
        if new.availability_status = 'unavailable' then
          new.availability_status := 'available';
        end if;
      when 'sold_out' then
        new.published := true;
        new.archived_at := null;
        new.availability_status := 'unavailable';
      when 'archived' then
        new.published := false;
        new.archived_at := coalesce(new.archived_at, now());
    end case;
  elsif new.published is distinct from old.published
    or new.archived_at is distinct from old.archived_at
    or new.availability_status is distinct from old.availability_status then
    new.status := case
      when new.archived_at is not null then 'archived'::public.product_status
      when new.published = false then 'draft'::public.product_status
      when new.availability_status = 'unavailable' then 'sold_out'::public.product_status
      else 'active'::public.product_status
    end;
  end if;

  if tg_op = 'INSERT' then
    new.sort_order := coalesce(new.sort_order, new.display_order, 0);
    new.display_order := new.sort_order;
  elsif new.sort_order is distinct from old.sort_order then
    new.display_order := new.sort_order;
  elsif new.display_order is distinct from old.display_order then
    new.sort_order := new.display_order;
  end if;
  return new;
end;
$$;

drop trigger if exists products_sync_multistore_fields on public.products;
create trigger products_sync_multistore_fields
before insert or update on public.products
for each row execute function private.sync_multistore_product_fields();

create or replace function private.sync_multistore_image_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.sort_order := coalesce(new.sort_order, new.display_order, 0);
    new.display_order := new.sort_order;
    new.is_primary := coalesce(new.is_primary, new.is_cover, false);
    new.is_cover := new.is_primary;
  else
    if new.sort_order is distinct from old.sort_order then
      new.display_order := new.sort_order;
    elsif new.display_order is distinct from old.display_order then
      new.sort_order := new.display_order;
    end if;
    if new.is_primary is distinct from old.is_primary then
      new.is_cover := new.is_primary;
    elsif new.is_cover is distinct from old.is_cover then
      new.is_primary := new.is_cover;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists product_images_sync_multistore_fields on public.product_images;
create trigger product_images_sync_multistore_fields
before insert or update on public.product_images
for each row execute function private.sync_multistore_image_fields();

-- Uniqueness becomes store-scoped while ids and storage paths stay globally safe.
alter table public.brands drop constraint if exists brands_slug_key;
alter table public.categories drop constraint if exists categories_slug_key;
alter table public.products drop constraint if exists products_slug_key;
alter table public.products drop constraint if exists products_sku_key;
drop index if exists public.products_sku_case_insensitive_idx;
alter table public.collections drop constraint if exists collections_slug_key;
alter table public.galleries drop constraint if exists galleries_slug_key;
alter table public.galleries drop constraint if exists galleries_route_placement_unique;
alter table public.promotions drop constraint if exists promotions_slug_key;
alter table public.styles drop constraint if exists styles_slug_key;
alter table public.site_settings drop constraint if exists site_settings_pkey;

create unique index if not exists brands_store_slug_key
  on public.brands (store_id, slug);
create unique index if not exists categories_store_slug_key
  on public.categories (store_id, slug);
create unique index if not exists products_store_slug_key
  on public.products (store_id, slug);
create unique index if not exists products_store_sku_key
  on public.products (store_id, lower(btrim(sku)))
  where sku is not null;
create unique index if not exists collections_store_slug_key
  on public.collections (store_id, slug);
create unique index if not exists galleries_store_slug_key
  on public.galleries (store_id, slug);
create unique index if not exists galleries_store_route_placement_key
  on public.galleries (store_id, route_key, placement_key);
create unique index if not exists promotions_store_slug_key
  on public.promotions (store_id, slug);
create unique index if not exists styles_store_slug_key
  on public.styles (store_id, slug);
alter table public.site_settings
  add constraint site_settings_pkey primary key (store_id, key);

-- Composite parent keys make cross-store relationships impossible.
alter table public.brands
  add constraint brands_store_id_id_key unique (store_id, id);
alter table public.categories
  add constraint categories_store_id_id_key unique (store_id, id);
alter table public.products
  add constraint products_store_id_id_key unique (store_id, id);
alter table public.product_images
  add constraint product_images_store_id_id_key unique (store_id, id);
alter table public.styles
  add constraint styles_store_id_id_key unique (store_id, id);
alter table public.collections
  add constraint collections_store_id_id_key unique (store_id, id);
alter table public.collection_publications
  add constraint collection_publications_store_id_id_key unique (store_id, id);
alter table public.galleries
  add constraint galleries_store_id_id_key unique (store_id, id);
alter table public.gallery_publications
  add constraint gallery_publications_store_id_id_key unique (store_id, id);
alter table public.promotions
  add constraint promotions_store_id_id_key unique (store_id, id);

alter table public.products
  add constraint products_store_brand_fkey
  foreign key (store_id, brand_id)
  references public.brands (store_id, id) on delete restrict;
alter table public.products
  add constraint products_store_category_fkey
  foreign key (store_id, category_id)
  references public.categories (store_id, id) on delete restrict;
alter table public.product_images
  add constraint product_images_store_product_fkey
  foreign key (store_id, product_id)
  references public.products (store_id, id) on delete cascade;
alter table public.product_image_variants
  add constraint product_image_variants_store_image_fkey
  foreign key (store_id, product_image_id)
  references public.product_images (store_id, id) on delete cascade;
alter table public.product_image_uploads
  add constraint product_image_uploads_store_product_fkey
  foreign key (store_id, product_id)
  references public.products (store_id, id) on delete cascade;
alter table public.product_styles
  add constraint product_styles_store_product_fkey
  foreign key (store_id, product_id)
  references public.products (store_id, id) on delete cascade;
alter table public.product_styles
  add constraint product_styles_store_style_fkey
  foreign key (store_id, style_id)
  references public.styles (store_id, id) on delete cascade;
alter table public.collection_products
  add constraint collection_products_store_collection_fkey
  foreign key (store_id, collection_id)
  references public.collections (store_id, id) on delete cascade;
alter table public.collection_products
  add constraint collection_products_store_product_fkey
  foreign key (store_id, product_id)
  references public.products (store_id, id) on delete cascade;
alter table public.collection_publications
  add constraint collection_publications_store_collection_fkey
  foreign key (store_id, collection_id)
  references public.collections (store_id, id) on delete cascade;
alter table public.collection_publication_products
  add constraint collection_publication_products_store_publication_fkey
  foreign key (store_id, publication_id)
  references public.collection_publications (store_id, id) on delete cascade;
alter table public.collection_publication_products
  add constraint collection_publication_products_store_product_fkey
  foreign key (store_id, product_id)
  references public.products (store_id, id) on delete cascade;
alter table public.gallery_items
  add constraint gallery_items_store_gallery_fkey
  foreign key (store_id, gallery_id)
  references public.galleries (store_id, id) on delete cascade;
alter table public.gallery_publications
  add constraint gallery_publications_store_gallery_fkey
  foreign key (store_id, gallery_id)
  references public.galleries (store_id, id) on delete cascade;
alter table public.gallery_publication_items
  add constraint gallery_publication_items_store_publication_fkey
  foreign key (store_id, publication_id)
  references public.gallery_publications (store_id, id) on delete cascade;
alter table public.promotion_products
  add constraint promotion_products_store_promotion_fkey
  foreign key (store_id, promotion_id)
  references public.promotions (store_id, id) on delete cascade;
alter table public.promotion_products
  add constraint promotion_products_store_product_fkey
  foreign key (store_id, product_id)
  references public.products (store_id, id) on delete cascade;
alter table public.analytics_events
  add constraint analytics_events_store_product_fkey
  foreign key (store_id, product_id)
  references public.products (store_id, id) on delete set null (product_id);
alter table public.analytics_events
  add constraint analytics_events_store_category_fkey
  foreign key (store_id, category_id)
  references public.categories (store_id, id) on delete set null (category_id);

-- Aggregate keys must include the store to avoid collisions between shops.
alter table public.analytics_daily_summary
  drop constraint if exists analytics_daily_summary_pkey;
alter table public.analytics_daily_summary
  add constraint analytics_daily_summary_pkey
  primary key (store_id, day, event_name, route);
alter table public.analytics_product_daily
  drop constraint if exists analytics_product_daily_pkey;
alter table public.analytics_product_daily
  add constraint analytics_product_daily_pkey
  primary key (store_id, day, product_id, event_name);
alter table public.analytics_style_daily
  drop constraint if exists analytics_style_daily_pkey;
alter table public.analytics_style_daily
  add constraint analytics_style_daily_pkey
  primary key (store_id, day, style_slug, event_name);
alter table public.analytics_conversion_daily
  drop constraint if exists analytics_conversion_daily_pkey;
alter table public.analytics_conversion_daily
  add constraint analytics_conversion_daily_pkey
  primary key (store_id, day, event_name, source_route);

create or replace function private.sync_analytics_daily_summaries()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.analytics_events%rowtype;
  delta integer;
  style_value text;
  source_value text;
begin
  target := case when tg_op = 'DELETE' then old else new end;
  delta := case when tg_op = 'DELETE' then -1 else 1 end;
  style_value := target.metadata ->> 'style_slug';
  source_value := coalesce(nullif(target.metadata ->> 'source_route', ''), target.route);

  insert into public.analytics_daily_summary(
    store_id, day, event_name, route, event_count
  )
  values(
    target.store_id, target.created_at::date, target.event_name,
    target.route, greatest(delta, 0)
  )
  on conflict(store_id, day, event_name, route)
  do update set event_count = greatest(
    0, public.analytics_daily_summary.event_count + delta
  );

  if target.product_id is not null then
    insert into public.analytics_product_daily(
      store_id, day, product_id, event_name, event_count
    )
    values(
      target.store_id, target.created_at::date, target.product_id,
      target.event_name, greatest(delta, 0)
    )
    on conflict(store_id, day, product_id, event_name)
    do update set event_count = greatest(
      0, public.analytics_product_daily.event_count + delta
    );
  end if;

  if style_value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    insert into public.analytics_style_daily(
      store_id, day, style_slug, event_name, event_count
    )
    values(
      target.store_id, target.created_at::date, style_value,
      target.event_name, greatest(delta, 0)
    )
    on conflict(store_id, day, style_slug, event_name)
    do update set event_count = greatest(
      0, public.analytics_style_daily.event_count + delta
    );
  end if;

  if target.event_name in (
    'page_view', 'curation_viewed', 'style_selected', 'catalog_opened',
    'product_opened', 'product_whatsapp_clicked',
    'general_whatsapp_clicked', 'product_view', 'product_whatsapp_click'
  ) then
    insert into public.analytics_conversion_daily(
      store_id, day, event_name, source_route, event_count
    )
    values(
      target.store_id, target.created_at::date, target.event_name,
      source_value, greatest(delta, 0)
    )
    on conflict(store_id, day, event_name, source_route)
    do update set event_count = greatest(
      0, public.analytics_conversion_daily.event_count + delta
    );
  end if;

  delete from public.analytics_daily_summary
  where store_id = target.store_id and event_count = 0;
  delete from public.analytics_product_daily
  where store_id = target.store_id and event_count = 0;
  delete from public.analytics_style_daily
  where store_id = target.store_id and event_count = 0;
  delete from public.analytics_conversion_daily
  where store_id = target.store_id and event_count = 0;
  return target;
end;
$$;

-- Store-aware authorization primitives.
create or replace function private.current_user_store_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select store_id
  from public.profiles
  where id = (select auth.uid())
    and active = true
  limit 1;
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
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and active = true
      and store_id = target_store_id
      and role = any(allowed_roles)
  );
$$;

revoke all on function private.current_user_store_id() from public, anon, authenticated;
revoke all on function private.has_store_role(uuid, public.admin_role[])
  from public, anon, authenticated;
grant execute on function private.current_user_store_id() to authenticated;
grant execute on function private.has_store_role(uuid, public.admin_role[])
  to authenticated;

-- Store registry policies.
alter table public.stores enable row level security;
revoke all on public.stores from anon, authenticated;
grant select on public.stores to anon, authenticated;
grant update on public.stores to authenticated;

drop policy if exists "public reads active stores" on public.stores;
create policy "public reads active stores"
on public.stores for select to anon
using (active = true);
drop policy if exists "staff reads own store" on public.stores;
create policy "staff reads own store"
on public.stores for select to authenticated
using (id = private.current_user_store_id());
drop policy if exists "admins update own store" on public.stores;
create policy "admins update own store"
on public.stores for update to authenticated
using (private.has_store_role(id, array['admin']::public.admin_role[]))
with check (private.has_store_role(id, array['admin']::public.admin_role[]));

-- Profiles are isolated by their assigned store.
alter policy "admins read all profiles" on public.profiles
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  );
alter policy "admins insert profiles" on public.profiles
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  );
alter policy "admins update profiles" on public.profiles
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  );
alter policy "admins delete profiles" on public.profiles
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  );

-- Anonymous policies remain Vision-only for backward compatibility.
-- Helena's public repository is server-only and always supplies its store id.
alter policy "public reads active brands" on public.brands
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and active = true
  );
alter policy "public reads active categories" on public.categories
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and active = true
  );
alter policy "public reads published products" on public.products
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and published = true
    and archived_at is null
  );
alter policy "public reads images of published products" on public.product_images
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and exists (
      select 1 from public.products
      where products.id = product_images.product_id
        and products.store_id = product_images.store_id
        and products.published = true
        and products.archived_at is null
    )
  );
alter policy "public reads active styles" on public.styles
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and active = true
  );
alter policy "public reads eligible product styles" on public.product_styles
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and exists (
      select 1 from public.styles
      where styles.id = product_styles.style_id
        and styles.store_id = product_styles.store_id
        and styles.active = true
    )
    and exists (
      select 1 from public.products
      where products.id = product_styles.product_id
        and products.store_id = product_styles.store_id
        and products.published = true
        and products.archived_at is null
    )
  );
alter policy "public reads current collections" on public.collections
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and published = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );
alter policy "public reads current collection products" on public.collection_products
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and exists (
      select 1 from public.collections
      where collections.id = collection_products.collection_id
        and collections.store_id = collection_products.store_id
        and collections.published = true
        and (collections.starts_at is null or collections.starts_at <= now())
        and (collections.ends_at is null or collections.ends_at >= now())
    )
    and exists (
      select 1 from public.products
      where products.id = collection_products.product_id
        and products.store_id = collection_products.store_id
        and products.published = true
        and products.archived_at is null
    )
  );
alter policy "public reads published galleries" on public.galleries
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and published = true
  );
alter policy "public reads published gallery items" on public.gallery_items
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and published = true
    and exists (
      select 1 from public.galleries
      where galleries.id = gallery_items.gallery_id
        and galleries.store_id = gallery_items.store_id
        and galleries.published = true
    )
  );
alter policy "public reads current promotions" on public.promotions
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and active = true
    and starts_at <= now()
    and ends_at >= now()
  );
alter policy "public reads current promotion products" on public.promotion_products
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and exists (
      select 1 from public.promotions
      where promotions.id = promotion_products.promotion_id
        and promotions.store_id = promotion_products.store_id
        and promotions.active = true
        and promotions.starts_at <= now()
        and promotions.ends_at >= now()
    )
    and exists (
      select 1 from public.products
      where products.id = promotion_products.product_id
        and products.store_id = promotion_products.store_id
        and products.published = true
        and products.archived_at is null
    )
  );
alter policy "public reads active collection publications"
  on public.collection_publications
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and active = true
    and home_enabled = true
  );
alter policy "public reads active collection publication products"
  on public.collection_publication_products
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and exists (
      select 1 from public.collection_publications publication
      where publication.id = collection_publication_products.publication_id
        and publication.store_id = collection_publication_products.store_id
        and publication.active = true
        and publication.home_enabled = true
    )
  );
alter policy "public reads active gallery publications"
  on public.gallery_publications
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and active = true
    and exists (
      select 1 from public.galleries
      where galleries.id = gallery_publications.gallery_id
        and galleries.store_id = gallery_publications.store_id
        and galleries.published = true
    )
  );
alter policy "public reads active gallery publication items"
  on public.gallery_publication_items
  using (
    store_id = '11111111-1111-4111-8111-111111111111'
    and exists (
      select 1
      from public.gallery_publications publication
      join public.galleries
        on galleries.id = publication.gallery_id
       and galleries.store_id = publication.store_id
      where publication.id = gallery_publication_items.publication_id
        and publication.store_id = gallery_publication_items.store_id
        and publication.active = true
        and galleries.published = true
    )
  );

-- Every authenticated commercial policy verifies both role and store.
alter policy "staff reads all brands" on public.brands
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage brands" on public.brands
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all categories" on public.categories
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage categories" on public.categories
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all products" on public.products
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage products" on public.products
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "attendants update product availability" on public.products
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['attendant']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['attendant']::public.admin_role[])
  );
alter policy "staff reads all product images" on public.product_images
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage product images" on public.product_images
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads product image variants" on public.product_image_variants
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage product image variants" on public.product_image_variants
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all styles" on public.styles
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "admins manage styles" on public.styles
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  );
alter policy "staff reads all product styles" on public.product_styles
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage product styles" on public.product_styles
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all collections" on public.collections
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage collections" on public.collections
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all collection products" on public.collection_products
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage collection products" on public.collection_products
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all collection publications"
  on public.collection_publications
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage collection publications"
  on public.collection_publications
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all collection publication products"
  on public.collection_publication_products
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage collection publication products"
  on public.collection_publication_products
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all galleries" on public.galleries
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage galleries" on public.galleries
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all gallery items" on public.gallery_items
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage gallery items" on public.gallery_items
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all gallery publications"
  on public.gallery_publications
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage gallery publications"
  on public.gallery_publications
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all gallery publication items"
  on public.gallery_publication_items
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage gallery publication items"
  on public.gallery_publication_items
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all promotions" on public.promotions
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage promotions" on public.promotions
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "staff reads all promotion products" on public.promotion_products
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "editors manage promotion products" on public.promotion_products
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "active staff reads settings" on public.site_settings
  using (store_id = private.current_user_store_id() and private.is_active_staff());
alter policy "admins manage settings" on public.site_settings
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  )
  with check (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  );
alter policy "admins read analytics" on public.analytics_events
  using (
    store_id = private.current_user_store_id()
    and private.has_any_role(array['admin']::public.admin_role[])
  );
alter policy "editors read own staged product uploads"
  on public.product_image_uploads
  using (
    store_id = private.current_user_store_id()
    and created_by = auth.uid()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "editors create own staged product uploads"
  on public.product_image_uploads
  with check (
    store_id = private.current_user_store_id()
    and created_by = auth.uid()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );
alter policy "editors remove own staged product uploads"
  on public.product_image_uploads
  using (
    store_id = private.current_user_store_id()
    and created_by = auth.uid()
    and private.has_any_role(array['admin','editor']::public.admin_role[])
  );

-- Namespace for Helena uploads. Legacy Vision objects are kept untouched.
drop policy if exists "store staff read namespaced product images" on storage.objects;
create policy "store staff read namespaced product images"
on storage.objects for select to authenticated
using (
  bucket_id = 'catalog-products'
  and name like (
    'stores/' || private.current_user_store_id()::text || '/products/%'
  )
  and private.is_active_staff()
);

-- Backfill compatibility aliases after structural DDL, with audit triggers
-- paused only for these deterministic, non-commercial values.
set local session_replication_role = replica;
update public.categories set sort_order = display_order;
update public.products
set
  sort_order = display_order,
  status = case
    when archived_at is not null then 'archived'::public.product_status
    when published = false then 'draft'::public.product_status
    when availability_status = 'unavailable' then 'sold_out'::public.product_status
    else 'active'::public.product_status
  end;
update public.product_images
set sort_order = display_order, is_primary = is_cover;
set local session_replication_role = origin;

-- Initial taxonomy only; no fictional products or commercial copy.
insert into public.categories (
  id, store_id, name, slug, icon_key, active, display_order, sort_order
)
values
  (
    '22222222-0001-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    'Colares', 'colares', 'necklaces', true, 0, 0
  ),
  (
    '22222222-0002-4000-8000-000000000002',
    '22222222-2222-4222-8222-222222222222',
    'Brincos', 'brincos', 'earrings', true, 1, 1
  ),
  (
    '22222222-0003-4000-8000-000000000003',
    '22222222-2222-4222-8222-222222222222',
    'Pulseiras', 'pulseiras', 'bracelets', true, 2, 2
  ),
  (
    '22222222-0004-4000-8000-000000000004',
    '22222222-2222-4222-8222-222222222222',
    'Anéis', 'aneis', 'rings', true, 3, 3
  ),
  (
    '22222222-0005-4000-8000-000000000005',
    '22222222-2222-4222-8222-222222222222',
    'Conjuntos', 'conjuntos', 'sets', true, 4, 4
  )
on conflict (store_id, slug) do update
set
  name = excluded.name,
  icon_key = excluded.icon_key,
  active = true,
  display_order = excluded.display_order,
  sort_order = excluded.sort_order;

-- New first-party events. Existing values are left untouched.
alter type public.analytics_event_name add value if not exists 'session_started';
alter type public.analytics_event_name add value if not exists 'category_view';
alter type public.analytics_event_name add value if not exists 'category_clicked';
alter type public.analytics_event_name add value if not exists 'product_impression';
alter type public.analytics_event_name add value if not exists 'product_clicked';
alter type public.analytics_event_name add value if not exists 'search_performed';
alter type public.analytics_event_name add value if not exists 'filter_applied';
alter type public.analytics_event_name add value if not exists 'add_to_cart';
alter type public.analytics_event_name add value if not exists 'remove_from_cart';
alter type public.analytics_event_name add value if not exists 'cart_viewed';
alter type public.analytics_event_name add value if not exists 'quantity_changed';
alter type public.analytics_event_name add value if not exists 'begin_whatsapp_checkout';
alter type public.analytics_event_name add value if not exists 'whatsapp_opened';
alter type public.analytics_event_name add value if not exists 'instagram_clicked';

commit;
