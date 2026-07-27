import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { assertHelenaStore } from "@/lib/store/context";
import {
  HELENA_STORE_ID,
  type CatalogFilters,
  type Category,
  type CategoryIconKey,
  type Product,
  type ProductImage,
  type Store,
  type StoreContext,
} from "@/types/commerce";

const DEVELOPMENT_CATEGORIES: Category[] = [
  ["22222222-0001-4000-8000-000000000001", "Colares", "colares", "necklaces"],
  ["22222222-0002-4000-8000-000000000002", "Brincos", "brincos", "earrings"],
  ["22222222-0003-4000-8000-000000000003", "Pulseiras", "pulseiras", "bracelets"],
  ["22222222-0004-4000-8000-000000000004", "Anéis", "aneis", "rings"],
  ["22222222-0005-4000-8000-000000000005", "Conjuntos", "conjuntos", "sets"],
].map(([id, name, slug, iconKey], sortOrder) => ({
  active: true,
  coverImageUrl: null,
  description: null,
  iconKey: iconKey as CategoryIconKey,
  id,
  name,
  slug,
  sortOrder,
  storeId: HELENA_STORE_ID,
}));

const DEVELOPMENT_STORE: Store = {
  active: true,
  currency: "BRL",
  description: null,
  id: HELENA_STORE_ID,
  instagramUrl: "https://www.instagram.com/helenaajoias/",
  locale: "pt-BR",
  logoUrl: null,
  name: "Helena Joias",
  showPrices: true,
  slug: "helena-joias",
  whatsappDefaultMessage: null,
  whatsappNumber: null,
};

type CategoryRow = {
  active: boolean;
  cover_image_url: string | null;
  description: string | null;
  icon_key: CategoryIconKey | null;
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  store_id: string;
};

type ImageRow = {
  alt_text: string;
  height: number | null;
  id: string;
  image_url: string | null;
  is_primary: boolean;
  product_id: string;
  sort_order: number;
  storage_path: string;
  store_id: string;
  width: number | null;
};

type ProductRow = {
  category_id: string | null;
  compare_at_price: number | string | null;
  created_at: string;
  description: string | null;
  featured: boolean;
  id: string;
  name: string;
  new_arrival: boolean;
  price: number | string | null;
  short_description: string | null;
  sku: string | null;
  slug: string;
  sort_order: number;
  status: Product["status"];
  store_id: string;
  updated_at: string;
};

function numberOrNull(value: number | string | null) {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapCategory(row: CategoryRow): Category {
  return {
    active: row.active,
    coverImageUrl: row.cover_image_url,
    description: row.description,
    iconKey: row.icon_key ?? "sets",
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
    storeId: row.store_id,
  };
}

function mapImage(row: ImageRow): ProductImage {
  return {
    altText: row.alt_text,
    height: row.height,
    id: row.id,
    isPrimary: row.is_primary,
    productId: row.product_id,
    sortOrder: row.sort_order,
    storeId: row.store_id,
    url: row.image_url ?? `/api/media/product/${row.id}`,
    width: row.width,
  };
}

function mapProduct(
  row: ProductRow,
  categories: Map<string, Category>,
  images: ImageRow[],
): Product {
  const category = row.category_id ? categories.get(row.category_id) ?? null : null;
  return {
    category: category
      ? { id: category.id, name: category.name, slug: category.slug }
      : null,
    categoryId: row.category_id,
    compareAtPrice: numberOrNull(row.compare_at_price),
    createdAt: row.created_at,
    description: row.description,
    featured: row.featured,
    id: row.id,
    images: images
      .filter((image) => image.product_id === row.id)
      .map(mapImage)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    name: row.name,
    newArrival: row.new_arrival,
    price: numberOrNull(row.price),
    shortDescription: row.short_description,
    sku: row.sku,
    slug: row.slug,
    sortOrder: row.sort_order,
    status: row.status,
    storeId: row.store_id,
    updatedAt: row.updated_at,
  };
}

function prepareContext(context: StoreContext) {
  assertHelenaStore(context);
  return context.id;
}

export async function getStore(context: StoreContext): Promise<Store> {
  const storeId = prepareContext(context);
  if (!hasSupabaseEnv()) return DEVELOPMENT_STORE;

  const { data, error } = await createSupabaseAdminClient()
    .from("stores")
    .select(
      "id,slug,name,description,logo_url,instagram_url,whatsapp_number,whatsapp_default_message,currency,locale,show_prices,active",
    )
    .eq("id", storeId)
    .eq("slug", context.slug)
    .single();

  if (error || !data) throw new Error("Não foi possível carregar a loja.");
  return {
    active: data.active,
    currency: data.currency,
    description: data.description,
    id: data.id,
    instagramUrl: data.instagram_url,
    locale: data.locale,
    logoUrl: data.logo_url,
    name: data.name,
    showPrices: data.show_prices,
    slug: data.slug,
    whatsappDefaultMessage: data.whatsapp_default_message,
    whatsappNumber: data.whatsapp_number,
  };
}

export async function listCategories(context: StoreContext): Promise<Category[]> {
  const storeId = prepareContext(context);
  if (!hasSupabaseEnv()) return DEVELOPMENT_CATEGORIES;

  const { data, error } = await createSupabaseAdminClient()
    .from("categories")
    .select(
      "id,store_id,name,slug,description,icon_key,cover_image_url,sort_order,active",
    )
    .eq("store_id", storeId)
    .eq("active", true)
    .order("sort_order")
    .order("name")
    .limit(100);

  if (error) throw new Error("Não foi possível carregar as categorias.");
  return (data as CategoryRow[]).map(mapCategory);
}

export async function listProducts(
  context: StoreContext,
  filters: CatalogFilters = {},
  page = 1,
  pageSize = 24,
): Promise<Product[]> {
  const storeId = prepareContext(context);
  if (!hasSupabaseEnv()) return [];

  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.min(48, Math.max(1, Math.floor(pageSize)));
  const from = (safePage - 1) * safeSize;
  let query = createSupabaseAdminClient()
    .from("products")
    .select(
      "id,store_id,category_id,name,slug,sku,short_description,description,price,compare_at_price,status,featured,new_arrival,sort_order,created_at,updated_at",
    )
    .eq("store_id", storeId)
    .in("status", ["active", "sold_out"])
    .order("sort_order")
    .order("created_at", { ascending: false })
    .range(from, from + safeSize - 1);

  if (filters.category) {
    const categories = await listCategories(context);
    const category = categories.find((item) => item.slug === filters.category);
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }
  if (filters.availability === "available") query = query.eq("status", "active");
  if (filters.availability === "sold_out") query = query.eq("status", "sold_out");
  if (filters.featured !== undefined) query = query.eq("featured", filters.featured);
  if (filters.newArrival !== undefined) {
    query = query.eq("new_arrival", filters.newArrival);
  }
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.query?.trim()) {
    const safeQuery = filters.query
      .trim()
      .slice(0, 80)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, " ");
    query = query.or(
      `name.ilike.%${safeQuery}%,short_description.ilike.%${safeQuery}%,sku.ilike.%${safeQuery}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error("Não foi possível carregar os produtos.");
  const rows = data as ProductRow[];
  if (!rows.length) return [];

  const [categories, imageResult] = await Promise.all([
    listCategories(context),
    createSupabaseAdminClient()
      .from("product_images")
      .select(
        "id,store_id,product_id,image_url,storage_path,alt_text,sort_order,is_primary,width,height",
      )
      .eq("store_id", storeId)
      .in(
        "product_id",
        rows.map((row) => row.id),
      )
      .order("sort_order"),
  ]);
  if (imageResult.error) throw new Error("Não foi possível carregar as imagens.");

  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  return rows.map((row) =>
    mapProduct(row, categoryMap, imageResult.data as ImageRow[]),
  );
}

export async function getProductBySlug(
  context: StoreContext,
  slug: string,
): Promise<Product | null> {
  const storeId = prepareContext(context);
  if (!hasSupabaseEnv()) return null;

  const normalizedSlug = slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) return null;
  const { data, error } = await createSupabaseAdminClient()
    .from("products")
    .select(
      "id,store_id,category_id,name,slug,sku,short_description,description,price,compare_at_price,status,featured,new_arrival,sort_order,created_at,updated_at",
    )
    .eq("store_id", storeId)
    .eq("slug", normalizedSlug)
    .in("status", ["active", "sold_out"])
    .maybeSingle();

  if (error) throw new Error("Não foi possível carregar o produto.");
  if (!data) return null;

  const [categories, imageResult] = await Promise.all([
    listCategories(context),
    createSupabaseAdminClient()
      .from("product_images")
      .select(
        "id,store_id,product_id,image_url,storage_path,alt_text,sort_order,is_primary,width,height",
      )
      .eq("store_id", storeId)
      .eq("product_id", data.id)
      .order("sort_order"),
  ]);
  if (imageResult.error) throw new Error("Não foi possível carregar as imagens.");

  return mapProduct(
    data as ProductRow,
    new Map(categories.map((category) => [category.id, category])),
    imageResult.data as ImageRow[],
  );
}

export async function listProductSitemap(
  context: StoreContext,
): Promise<Array<{ slug: string; updatedAt: string }>> {
  const storeId = prepareContext(context);
  if (!hasSupabaseEnv()) return [];

  const { data, error } = await createSupabaseAdminClient()
    .from("products")
    .select("slug,updated_at")
    .eq("store_id", storeId)
    .in("status", ["active", "sold_out"])
    .order("updated_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error("Não foi possível gerar o sitemap dos produtos.");
  return data.map((item) => ({ slug: item.slug, updatedAt: item.updated_at }));
}
