-- Keep existing slugs stable while correcting the customer-facing product name.
update public.products
set name = regexp_replace(
  regexp_replace(name, 'óculos', 'Colar', 'gi'),
  'oculos',
  'Colar',
  'gi'
)
where name ~* 'óculos|oculos';
