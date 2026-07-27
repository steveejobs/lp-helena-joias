begin;

-- Vision keeps its five-derivative publishing contract. Helena runs on the
-- Cloudflare/Vinext worker, where native image codecs are unavailable, so its
-- admin accepts an already optimized WebP master after strict server validation.
create or replace function private.validate_publishable_content()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'products' then
    if new.archived_at is not null then
      new.published := false;
      new.featured := false;
    end if;

    if new.featured and not new.published then
      raise exception 'Featured products must be published' using errcode = '23514';
    end if;

    if new.published and new.brand_id is not null and not exists (
      select 1 from public.brands
      where id = new.brand_id and store_id = new.store_id and active = true
    ) then
      raise exception 'Published products require an active linked brand' using errcode = '23514';
    end if;

    if new.published and new.category_id is not null and not exists (
      select 1 from public.categories
      where id = new.category_id and store_id = new.store_id and active = true
    ) then
      raise exception 'Published products require an active linked category' using errcode = '23514';
    end if;

    if new.published and not exists (
      select 1
      from public.product_images as image
      where image.product_id = new.id
        and image.store_id = new.store_id
        and image.is_cover = true
        and btrim(image.alt_text) <> ''
        and image.width is not null
        and image.height is not null
        and image.mime_type is not null
        and image.size_bytes is not null
        and image.blur_data_url is not null
        and (
          new.store_id = '22222222-2222-4222-8222-222222222222'::uuid
          or (
            select count(distinct variant.kind)
            from public.product_image_variants as variant
            where variant.product_image_id = image.id
              and variant.store_id = image.store_id
              and variant.asset_version = image.asset_version
          ) = 5
        )
    ) then
      raise exception 'Published products require a complete cover image' using errcode = '23514';
    end if;
  elsif tg_table_name = 'galleries' then
    if new.published and not exists (
      select 1
      from public.gallery_items
      where gallery_id = new.id
        and store_id = new.store_id
        and published = true
        and btrim(alt_text) <> ''
        and width is not null
        and height is not null
    ) then
      raise exception 'Published galleries require a published image' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.enforce_product_cover_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_product_id uuid;
  target_store_id uuid;
  target_image_id uuid;
begin
  if tg_table_name = 'product_image_variants' then
    target_image_id := case when tg_op = 'DELETE' then old.product_image_id else new.product_image_id end;
    select product_id, store_id into target_product_id, target_store_id
    from public.product_images
    where id = target_image_id;
  else
    target_product_id := case when tg_op = 'DELETE' then old.product_id else new.product_id end;
    target_store_id := case when tg_op = 'DELETE' then old.store_id else new.store_id end;
  end if;

  if target_product_id is not null and exists (
    select 1 from public.products
    where id = target_product_id
      and store_id = target_store_id
      and published = true
      and archived_at is null
  ) and not exists (
    select 1
    from public.product_images as image
    where image.product_id = target_product_id
      and image.store_id = target_store_id
      and image.is_cover = true
      and btrim(image.alt_text) <> ''
      and image.width is not null
      and image.height is not null
      and image.mime_type is not null
      and image.size_bytes is not null
      and image.blur_data_url is not null
      and (
        target_store_id = '22222222-2222-4222-8222-222222222222'::uuid
        or (
          select count(distinct variant.kind)
          from public.product_image_variants as variant
          where variant.product_image_id = image.id
            and variant.store_id = image.store_id
            and variant.asset_version = image.asset_version
        ) = 5
      )
  ) then
    raise exception 'Published products require a complete cover image' using errcode = '23514';
  end if;
  return null;
end;
$$;

commit;
