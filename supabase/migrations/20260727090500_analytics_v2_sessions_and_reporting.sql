begin;

alter table public.analytics_events
  add column if not exists event_id uuid not null default gen_random_uuid(),
  add column if not exists client_id uuid,
  add column if not exists occurred_at timestamptz not null default now(),
  add column if not exists country_code text,
  add column if not exists region text,
  add column if not exists city text,
  add column if not exists city_latitude numeric(5, 1),
  add column if not exists city_longitude numeric(5, 1);

update public.analytics_events
set occurred_at = created_at
where occurred_at is distinct from created_at
  and client_id is null;

create unique index if not exists analytics_events_store_event_key
  on public.analytics_events (store_id, event_id);
create index if not exists analytics_events_store_occurred_idx
  on public.analytics_events (store_id, occurred_at desc);
create index if not exists analytics_events_store_session_occurred_idx
  on public.analytics_events (store_id, session_id, occurred_at desc);
create index if not exists analytics_events_store_city_occurred_idx
  on public.analytics_events (store_id, city, occurred_at desc)
  where city is not null;

create table if not exists public.analytics_sessions (
  store_id uuid not null references public.stores (id) on delete restrict,
  session_id uuid not null,
  client_id uuid not null,
  started_at timestamptz not null,
  last_seen_at timestamptz not null,
  landing_path text not null,
  exit_path text not null,
  page_view_count integer not null default 0,
  engaged_time_ms bigint not null default 0,
  device_class text not null default 'desktop',
  browser text not null default 'Outro',
  operating_system text not null default 'Outro',
  country_code text,
  region text,
  city text,
  city_latitude numeric(5, 1),
  city_longitude numeric(5, 1),
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (store_id, session_id),
  constraint analytics_sessions_path_length check (
    char_length(landing_path) between 1 and 500
    and char_length(exit_path) between 1 and 500
  ),
  constraint analytics_sessions_page_views_nonnegative check (page_view_count >= 0),
  constraint analytics_sessions_engagement_nonnegative check (engaged_time_ms >= 0),
  constraint analytics_sessions_device_allowed check (
    device_class in ('mobile', 'tablet', 'desktop')
  ),
  constraint analytics_sessions_country_format check (
    country_code is null or country_code ~ '^[A-Z]{2}$'
  ),
  constraint analytics_sessions_city_latitude check (
    city_latitude is null or city_latitude between -90 and 90
  ),
  constraint analytics_sessions_city_longitude check (
    city_longitude is null or city_longitude between -180 and 180
  )
);

create index if not exists analytics_sessions_store_started_idx
  on public.analytics_sessions (store_id, started_at desc);
create index if not exists analytics_sessions_store_client_idx
  on public.analytics_sessions (store_id, client_id, started_at);
create index if not exists analytics_sessions_store_city_idx
  on public.analytics_sessions (store_id, city, started_at desc)
  where city is not null;
create index if not exists analytics_sessions_store_recent_idx
  on public.analytics_sessions (store_id, last_seen_at desc);

alter table public.analytics_sessions enable row level security;
revoke all on public.analytics_sessions from anon, authenticated;
grant select on public.analytics_sessions to authenticated;

drop policy if exists "admins read own store analytics sessions"
  on public.analytics_sessions;
create policy "admins read own store analytics sessions"
on public.analytics_sessions for select to authenticated
using (
  store_id = private.current_user_store_id()
  and private.has_any_role(array['admin']::public.admin_role[])
);

create or replace function public.record_store_analytics_event(
  p_store_id uuid,
  p_event_id uuid,
  p_event_name public.analytics_event_name,
  p_session_id uuid,
  p_client_id uuid,
  p_product_id uuid,
  p_category_id uuid,
  p_route text,
  p_referrer text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_metadata jsonb,
  p_device_class text,
  p_browser text,
  p_operating_system text,
  p_country_code text,
  p_region text,
  p_city text,
  p_city_latitude numeric,
  p_city_longitude numeric
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  engagement_delta bigint := 0;
  inserted_count integer := 0;
begin
  if p_store_id is null
    or p_event_id is null
    or p_session_id is null
    or p_client_id is null
    or not exists (
      select 1 from public.stores
      where id = p_store_id and active = true
    )
    or p_route is null
    or p_route !~ '^/'
    or char_length(p_route) > 500
    or jsonb_typeof(clean_metadata) <> 'object'
    or pg_column_size(clean_metadata) > 4096
    or p_device_class not in ('mobile', 'tablet', 'desktop')
    or (p_country_code is not null and p_country_code !~ '^[A-Z]{2}$')
  then
    return false;
  end if;

  if p_product_id is not null and not exists (
    select 1 from public.products
    where id = p_product_id and store_id = p_store_id
  ) then
    return false;
  end if;

  if p_category_id is not null and not exists (
    select 1 from public.categories
    where id = p_category_id and store_id = p_store_id
  ) then
    return false;
  end if;

  insert into public.analytics_events (
    event_id,
    event_name,
    product_id,
    category_id,
    route,
    referrer_domain,
    anonymous_session_id,
    metadata,
    store_id,
    session_id,
    client_id,
    occurred_at,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    country_code,
    region,
    city,
    city_latitude,
    city_longitude
  ) values (
    p_event_id,
    p_event_name,
    p_product_id,
    p_category_id,
    p_route,
    p_referrer,
    p_session_id,
    clean_metadata,
    p_store_id,
    p_session_id::text,
    p_client_id,
    now(),
    p_referrer,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign,
    p_country_code,
    p_region,
    p_city,
    round(p_city_latitude, 1),
    round(p_city_longitude, 1)
  )
  on conflict (store_id, event_id) do nothing;

  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then
    return true;
  end if;

  if p_event_name = 'page_engagement' then
    engagement_delta := least(
      greatest(coalesce((clean_metadata ->> 'engagement_ms')::bigint, 0), 0),
      60000
    );
  end if;

  insert into public.analytics_sessions (
    store_id,
    session_id,
    client_id,
    started_at,
    last_seen_at,
    landing_path,
    exit_path,
    page_view_count,
    engaged_time_ms,
    device_class,
    browser,
    operating_system,
    country_code,
    region,
    city,
    city_latitude,
    city_longitude,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign
  ) values (
    p_store_id,
    p_session_id,
    p_client_id,
    now(),
    now(),
    p_route,
    p_route,
    case when p_event_name = 'page_view' then 1 else 0 end,
    engagement_delta,
    p_device_class,
    p_browser,
    p_operating_system,
    p_country_code,
    p_region,
    p_city,
    round(p_city_latitude, 1),
    round(p_city_longitude, 1),
    p_referrer,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign
  )
  on conflict (store_id, session_id) do update set
    last_seen_at = now(),
    exit_path = excluded.exit_path,
    page_view_count = public.analytics_sessions.page_view_count
      + case when p_event_name = 'page_view' then 1 else 0 end,
    engaged_time_ms = public.analytics_sessions.engaged_time_ms + engagement_delta,
    device_class = excluded.device_class,
    browser = excluded.browser,
    operating_system = excluded.operating_system,
    country_code = coalesce(public.analytics_sessions.country_code, excluded.country_code),
    region = coalesce(public.analytics_sessions.region, excluded.region),
    city = coalesce(public.analytics_sessions.city, excluded.city),
    city_latitude = coalesce(public.analytics_sessions.city_latitude, excluded.city_latitude),
    city_longitude = coalesce(public.analytics_sessions.city_longitude, excluded.city_longitude),
    referrer = coalesce(public.analytics_sessions.referrer, excluded.referrer),
    utm_source = coalesce(public.analytics_sessions.utm_source, excluded.utm_source),
    utm_medium = coalesce(public.analytics_sessions.utm_medium, excluded.utm_medium),
    utm_campaign = coalesce(public.analytics_sessions.utm_campaign, excluded.utm_campaign),
    updated_at = now();

  return true;
exception
  when invalid_text_representation or numeric_value_out_of_range then
    return false;
end;
$$;

revoke all on function public.record_store_analytics_event(
  uuid, uuid, public.analytics_event_name, uuid, uuid, uuid, uuid, text,
  text, text, text, text, jsonb, text, text, text, text, text, text,
  numeric, numeric
) from public, anon, authenticated;
grant execute on function public.record_store_analytics_event(
  uuid, uuid, public.analytics_event_name, uuid, uuid, uuid, uuid, text,
  text, text, text, text, jsonb, text, text, text, text, text, text,
  numeric, numeric
) to service_role;

create or replace function public.admin_store_analytics_v2(
  p_start timestamptz,
  p_end timestamptz
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  target_store uuid;
  duration interval;
  previous_start timestamptz;
  result jsonb;
begin
  target_store := private.current_user_store_id();
  if target_store is null
    or not private.has_any_role(array['admin']::public.admin_role[])
  then
    raise exception 'Administrative analytics access required'
      using errcode = '42501';
  end if;
  if p_start is null or p_end is null or p_end <= p_start
    or p_end - p_start > interval '367 days'
  then
    raise exception 'Invalid analytics period' using errcode = '22023';
  end if;

  duration := p_end - p_start;
  previous_start := p_start - duration;

  with
  current_events as (
    select *
    from public.analytics_events
    where store_id = target_store
      and occurred_at >= p_start and occurred_at <= p_end
  ),
  previous_events as (
    select *
    from public.analytics_events
    where store_id = target_store
      and occurred_at >= previous_start and occurred_at < p_start
  ),
  current_sessions as (
    select *
    from public.analytics_sessions
    where store_id = target_store
      and started_at >= p_start and started_at <= p_end
  ),
  previous_sessions as (
    select *
    from public.analytics_sessions
    where store_id = target_store
      and started_at >= previous_start and started_at < p_start
  ),
  product_rows as (
    select
      product.id,
      product.name as label,
      count(*) filter (where event.event_name = 'product_impression')::integer as impressions,
      count(*) filter (where event.event_name = 'product_clicked')::integer as clicks,
      count(*) filter (where event.event_name = 'product_view')::integer as views,
      count(*) filter (where event.event_name = 'add_to_cart')::integer as additions,
      count(*) filter (
        where event.event_name = 'checkout_product'
          or (
            event.event_name = 'begin_whatsapp_checkout'
            and event.product_id is not null
          )
      )::integer as whatsapp_intents
    from current_events as event
    join public.products as product
      on product.id = event.product_id and product.store_id = event.store_id
    group by product.id, product.name
  ),
  category_rows as (
    select
      category.id,
      category.name as label,
      count(*)::integer as count
    from current_events as event
    join public.categories as category
      on category.id = event.category_id and category.store_id = event.store_id
    where event.event_name in ('category_view', 'category_clicked')
    group by category.id, category.name
    order by count(*) desc
    limit 12
  ),
  search_rows as (
    select
      lower(btrim(metadata ->> 'query')) as label,
      count(*)::integer as count,
      count(*) filter (
        where coalesce((metadata ->> 'result_count')::integer, 0) = 0
      )::integer as zero_results
    from current_events
    where event_name in ('search_performed', 'search_zero_results')
      and nullif(btrim(metadata ->> 'query'), '') is not null
    group by lower(btrim(metadata ->> 'query'))
    order by count(*) desc
    limit 12
  ),
  city_rows as (
    select
      city,
      region,
      country_code,
      round(avg(city_latitude), 1) as latitude,
      round(avg(city_longitude), 1) as longitude,
      count(*)::integer as sessions
    from current_sessions
    where city is not null
      and city_latitude is not null
      and city_longitude is not null
    group by city, region, country_code
    order by count(*) desc
    limit 100
  ),
  source_rows as (
    select
      coalesce(nullif(utm_source, ''), nullif(referrer, ''), 'Direto') as label,
      count(*)::integer as count
    from current_sessions
    group by coalesce(nullif(utm_source, ''), nullif(referrer, ''), 'Direto')
    order by count(*) desc
    limit 12
  ),
  campaign_rows as (
    select utm_campaign as label, count(*)::integer as count
    from current_sessions
    where nullif(utm_campaign, '') is not null
    group by utm_campaign
    order by count(*) desc
    limit 12
  ),
  device_rows as (
    select device_class as label, count(*)::integer as count
    from current_sessions group by device_class order by count(*) desc
  ),
  browser_rows as (
    select browser as label, count(*)::integer as count
    from current_sessions group by browser order by count(*) desc limit 8
  ),
  os_rows as (
    select operating_system as label, count(*)::integer as count
    from current_sessions group by operating_system order by count(*) desc limit 8
  ),
  page_rows as (
    select route as label, count(*)::integer as count
    from current_events where event_name = 'page_view'
    group by route order by count(*) desc limit 12
  ),
  entry_rows as (
    select landing_path as label, count(*)::integer as count
    from current_sessions group by landing_path order by count(*) desc limit 10
  ),
  exit_rows as (
    select exit_path as label, count(*)::integer as count
    from current_sessions group by exit_path order by count(*) desc limit 10
  ),
  daily_rows as (
    select
      date_trunc('day', occurred_at) as day,
      count(*) filter (where event_name = 'page_view')::integer as views,
      count(distinct session_id)::integer as sessions,
      count(*) filter (where event_name = 'add_to_cart')::integer as additions,
      count(*) filter (where event_name = 'begin_whatsapp_checkout')::integer as whatsapp
    from current_events
    group by date_trunc('day', occurred_at)
    order by day
  ),
  current_totals as (
    select
      count(*)::integer as events,
      count(*) filter (where event_name = 'page_view')::integer as visits,
      count(*) filter (where event_name = 'product_view')::integer as product_views,
      count(*) filter (where event_name = 'whatsapp_opened')::integer as whatsapp_clicks,
      count(*) filter (where event_name = 'search_zero_results')::integer as zero_result_searches
    from current_events
  ),
  previous_totals as (
    select
      count(*) filter (where event_name = 'page_view')::integer as visits
    from previous_events
  ),
  session_totals as (
    select
      count(*)::integer as sessions,
      count(*) filter (
        where exists (
          select 1 from public.analytics_sessions older
          where older.store_id = target_store
            and older.client_id = current_sessions.client_id
            and older.started_at < current_sessions.started_at
        )
      )::integer as returning_sessions,
      count(*) filter (
        where page_view_count = 1 and engaged_time_ms < 10000
      )::integer as quick_exits,
      coalesce(round(avg(engaged_time_ms)), 0)::bigint as average_engaged_ms,
      coalesce(round(avg(
        extract(epoch from (last_seen_at - started_at)) * 1000
      )), 0)::bigint as average_duration_ms
    from current_sessions
  ),
  previous_session_totals as (
    select count(*)::integer as sessions from previous_sessions
  ),
  funnel as (
    select
      count(distinct session_id) filter (where event_name = 'product_view')::integer as viewed,
      count(distinct session_id) filter (where event_name = 'add_to_cart')::integer as cart,
      count(distinct session_id) filter (where event_name = 'begin_whatsapp_checkout')::integer as whatsapp,
      count(distinct session_id) filter (where event_name = 'whatsapp_opened')::integer as opened,
      count(distinct session_id) filter (
        where event_name = 'add_to_cart'
          and not exists (
            select 1 from current_events checkout
            where checkout.session_id = current_events.session_id
              and checkout.event_name = 'begin_whatsapp_checkout'
          )
      )::integer as abandoned
    from current_events
  )
  select jsonb_build_object(
    'overview', jsonb_build_object(
      'events', current_totals.events,
      'visits', current_totals.visits,
      'productViews', current_totals.product_views,
      'whatsappClicks', current_totals.whatsapp_clicks,
      'zeroResultSearches', current_totals.zero_result_searches,
      'sessions', session_totals.sessions,
      'returningSessions', session_totals.returning_sessions,
      'newSessions', greatest(session_totals.sessions - session_totals.returning_sessions, 0),
      'quickExits', session_totals.quick_exits,
      'averageEngagedMs', session_totals.average_engaged_ms,
      'averageDurationMs', session_totals.average_duration_ms,
      'realtime', (
        select count(*) from public.analytics_sessions
        where store_id = target_store and last_seen_at >= now() - interval '5 minutes'
      )
    ),
    'comparison', jsonb_build_object(
      'visits', previous_totals.visits,
      'sessions', previous_session_totals.sessions
    ),
    'funnel', jsonb_build_object(
      'viewed', funnel.viewed,
      'cart', funnel.cart,
      'whatsapp', funnel.whatsapp,
      'opened', funnel.opened,
      'abandoned', funnel.abandoned
    ),
    'products', coalesce((
      select jsonb_agg(to_jsonb(r) order by r.views desc, r.clicks desc)
      from (select * from product_rows order by views desc, clicks desc limit 16) r
    ), '[]'::jsonb),
    'categories', coalesce((select jsonb_agg(to_jsonb(r)) from category_rows r), '[]'::jsonb),
    'searches', coalesce((select jsonb_agg(to_jsonb(r)) from search_rows r), '[]'::jsonb),
    'cities', coalesce((select jsonb_agg(to_jsonb(r)) from city_rows r), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(to_jsonb(r)) from source_rows r), '[]'::jsonb),
    'campaigns', coalesce((select jsonb_agg(to_jsonb(r)) from campaign_rows r), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(to_jsonb(r)) from device_rows r), '[]'::jsonb),
    'browsers', coalesce((select jsonb_agg(to_jsonb(r)) from browser_rows r), '[]'::jsonb),
    'operatingSystems', coalesce((select jsonb_agg(to_jsonb(r)) from os_rows r), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(to_jsonb(r)) from page_rows r), '[]'::jsonb),
    'entries', coalesce((select jsonb_agg(to_jsonb(r)) from entry_rows r), '[]'::jsonb),
    'exits', coalesce((select jsonb_agg(to_jsonb(r)) from exit_rows r), '[]'::jsonb),
    'daily', coalesce((select jsonb_agg(to_jsonb(r)) from daily_rows r), '[]'::jsonb)
  )
  into result
  from current_totals, previous_totals, session_totals,
    previous_session_totals, funnel;

  return coalesce(result, '{}'::jsonb);
end;
$$;

revoke all on function public.admin_store_analytics_v2(timestamptz, timestamptz)
  from public, anon;
grant execute on function public.admin_store_analytics_v2(timestamptz, timestamptz)
  to authenticated;

comment on table public.analytics_sessions is
  'First-party anonymous sessions isolated by store. Geo is city-level only; no IP or precise GPS is stored.';

commit;
