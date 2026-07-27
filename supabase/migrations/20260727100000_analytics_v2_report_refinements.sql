begin;

-- The report body is replaced from the canonical v2 migration below. This
-- incremental patch adds direct product-page WhatsApp intent to per-product
-- conversion without changing previously collected data.
create or replace function public.admin_store_analytics_v2(
  p_start timestamptz,
  p_end timestamptz
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $function$
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
    select * from public.analytics_events
    where store_id = target_store
      and occurred_at >= p_start and occurred_at <= p_end
  ),
  previous_events as (
    select * from public.analytics_events
    where store_id = target_store
      and occurred_at >= previous_start and occurred_at < p_start
  ),
  current_sessions as (
    select * from public.analytics_sessions
    where store_id = target_store
      and started_at >= p_start and started_at <= p_end
  ),
  previous_sessions as (
    select * from public.analytics_sessions
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
    select category.id, category.name as label, count(*)::integer as count
    from current_events as event
    join public.categories as category
      on category.id = event.category_id and category.store_id = event.store_id
    where event.event_name in ('category_view', 'category_clicked')
    group by category.id, category.name
    order by count(*) desc limit 12
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
    order by count(*) desc limit 12
  ),
  city_rows as (
    select city, region, country_code,
      round(avg(city_latitude), 1) as latitude,
      round(avg(city_longitude), 1) as longitude,
      count(*)::integer as sessions
    from current_sessions
    where city is not null and city_latitude is not null and city_longitude is not null
    group by city, region, country_code
    order by count(*) desc limit 100
  ),
  source_rows as (
    select coalesce(nullif(utm_source, ''), nullif(referrer, ''), 'Direto') as label,
      count(*)::integer as count
    from current_sessions
    group by coalesce(nullif(utm_source, ''), nullif(referrer, ''), 'Direto')
    order by count(*) desc limit 12
  ),
  campaign_rows as (
    select utm_campaign as label, count(*)::integer as count
    from current_sessions where nullif(utm_campaign, '') is not null
    group by utm_campaign order by count(*) desc limit 12
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
    select date_trunc('day', occurred_at) as day,
      count(*) filter (where event_name = 'page_view')::integer as views,
      count(distinct session_id)::integer as sessions,
      count(*) filter (where event_name = 'add_to_cart')::integer as additions,
      count(*) filter (where event_name = 'begin_whatsapp_checkout')::integer as whatsapp
    from current_events group by date_trunc('day', occurred_at) order by day
  ),
  current_totals as (
    select count(*)::integer as events,
      count(*) filter (where event_name = 'page_view')::integer as visits,
      count(*) filter (where event_name = 'product_view')::integer as product_views,
      count(*) filter (where event_name = 'whatsapp_opened')::integer as whatsapp_clicks,
      count(*) filter (where event_name = 'search_zero_results')::integer as zero_result_searches
    from current_events
  ),
  previous_totals as (
    select count(*) filter (where event_name = 'page_view')::integer as visits
    from previous_events
  ),
  session_totals as (
    select count(*)::integer as sessions,
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
      'events', current_totals.events, 'visits', current_totals.visits,
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
      'visits', previous_totals.visits, 'sessions', previous_session_totals.sessions
    ),
    'funnel', jsonb_build_object(
      'viewed', funnel.viewed, 'cart', funnel.cart,
      'whatsapp', funnel.whatsapp, 'opened', funnel.opened,
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
$function$;

commit;
