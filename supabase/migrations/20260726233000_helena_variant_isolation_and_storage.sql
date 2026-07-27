begin;

-- Existing Vision variants are assigned before enforcing the commercial tenant key.
alter table public.product_image_variants
  add column if not exists store_id uuid;

update public.product_image_variants as variant
set store_id = image.store_id
from public.product_images as image
where image.id = variant.product_image_id
  and variant.store_id is null;

alter table public.product_image_variants
  alter column store_id set not null;

alter table public.product_image_variants
  drop constraint if exists product_image_variants_store_image_fkey;
alter table public.product_image_variants
  add constraint product_image_variants_store_image_fkey
  foreign key (store_id, product_image_id)
  references public.product_images (store_id, id)
  on delete cascade;

create index if not exists product_image_variants_store_image_idx
  on public.product_image_variants (store_id, product_image_id, kind);

drop policy if exists "staff reads product image variants"
  on public.product_image_variants;
create policy "staff reads product image variants"
on public.product_image_variants for select to authenticated
using (
  store_id = private.current_user_store_id()
  and private.is_active_staff()
);

drop policy if exists "editors manage product image variants"
  on public.product_image_variants;
create policy "editors manage product image variants"
on public.product_image_variants for all to authenticated
using (
  store_id = private.current_user_store_id()
  and private.has_any_role(array['admin', 'editor']::public.admin_role[])
)
with check (
  store_id = private.current_user_store_id()
  and private.has_any_role(array['admin', 'editor']::public.admin_role[])
);

-- Extra permissive policies keep Vision's legacy object paths intact while
-- requiring the explicit store namespace for every Helena catalog mutation.
drop policy if exists "store editors upload namespaced product images" on storage.objects;
create policy "store editors upload namespaced product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'catalog-products'
  and name like (
    'stores/' || private.current_user_store_id()::text || '/products/%'
  )
  and name ~* '^stores/[0-9a-f-]{36}/products/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpe?g|png|webp|avif)$'
  and private.has_any_role(array['admin', 'editor']::public.admin_role[])
);

drop policy if exists "store editors update namespaced product images" on storage.objects;
create policy "store editors update namespaced product images"
on storage.objects for update to authenticated
using (
  bucket_id = 'catalog-products'
  and name like (
    'stores/' || private.current_user_store_id()::text || '/products/%'
  )
  and private.has_any_role(array['admin', 'editor']::public.admin_role[])
)
with check (
  bucket_id = 'catalog-products'
  and name like (
    'stores/' || private.current_user_store_id()::text || '/products/%'
  )
  and private.has_any_role(array['admin', 'editor']::public.admin_role[])
);

drop policy if exists "store editors delete namespaced product images" on storage.objects;
create policy "store editors delete namespaced product images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'catalog-products'
  and name like (
    'stores/' || private.current_user_store_id()::text || '/products/%'
  )
  and private.has_any_role(array['admin', 'editor']::public.admin_role[])
);

commit;
