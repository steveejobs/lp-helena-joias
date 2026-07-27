begin;

-- Additive only: Vision's event dictionary remains untouched.
alter type public.analytics_event_name add value if not exists 'page_engagement';
alter type public.analytics_event_name add value if not exists 'search_zero_results';
alter type public.analytics_event_name add value if not exists 'checkout_product';
alter type public.analytics_event_name add value if not exists 'cart_cleared';

commit;
