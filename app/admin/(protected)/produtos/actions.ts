"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checked,
  integerValue,
  optionalMoney,
  slugValue,
  textValue,
  uuidValue,
} from "@/lib/admin/validation";
import { requireAdminRole } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID, type ProductStatus } from "@/types/commerce";

const STATUSES = new Set<ProductStatus>(["draft", "active", "sold_out", "archived"]);

function productPayload(formData: FormData) {
  const name = textValue(formData, "name", { max: 160 });
  const price = optionalMoney(formData, "price");
  const compareAtPrice = optionalMoney(formData, "compareAtPrice");
  if (price && compareAtPrice && compareAtPrice <= price) {
    throw new Error("O preço anterior deve ser maior que o preço atual.");
  }
  const status = String(formData.get("status") ?? "draft") as ProductStatus;
  if (!STATUSES.has(status)) throw new Error("Status inválido.");

  return {
    category_id: uuidValue(formData, "categoryId", true),
    compare_at_price: compareAtPrice,
    description: textValue(formData, "description", { max: 8000, optional: true }),
    featured: checked(formData, "featured") && status === "active",
    name,
    new_arrival: checked(formData, "newArrival"),
    price,
    price_visibility: price === null ? "consult" : "visible",
    short_description: textValue(formData, "shortDescription", { max: 600, optional: true }),
    sku: textValue(formData, "sku", { max: 80, optional: true }),
    slug: slugValue(textValue(formData, "slug", { max: 120, optional: true }) ?? name),
    sort_order: integerValue(formData, "sortOrder", { max: 99999 }),
    status,
  };
}

function refreshCatalog(slug?: string) {
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/produto/${slug}`);
}

export async function createProductAction(formData: FormData) {
  await requireAdminRole(["admin", "editor"], "/admin/produtos/novo");
  let payload: ReturnType<typeof productPayload>;
  try {
    payload = productPayload(formData);
  } catch {
    redirect("/admin/produtos/novo?erro=campos");
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ ...payload, status: "draft", featured: false, store_id: HELENA_STORE_ID })
    .select("id")
    .single();
  if (error || !data) redirect("/admin/produtos/novo?erro=salvar");
  refreshCatalog();
  redirect(`/admin/produtos/${data.id}?ok=criado`);
}

export async function updateProductAction(formData: FormData) {
  await requireAdminRole(["admin", "editor"], "/admin/produtos");
  const id = uuidValue(formData, "id");
  let payload: ReturnType<typeof productPayload>;
  try {
    payload = productPayload(formData);
  } catch {
    redirect(`/admin/produtos/${id}?erro=campos`);
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .eq("store_id", HELENA_STORE_ID);
  if (error) redirect(`/admin/produtos/${id}?erro=salvar`);
  refreshCatalog(payload.slug);
  redirect(`/admin/produtos/${id}?ok=salvo`);
}

export async function archiveProductAction(formData: FormData) {
  await requireAdminRole(["admin", "editor"], "/admin/produtos");
  const id = uuidValue(formData, "id");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({ featured: false, status: "archived" })
    .eq("id", id)
    .eq("store_id", HELENA_STORE_ID)
    .select("slug")
    .maybeSingle();
  if (error || !data) redirect(`/admin/produtos/${id}?erro=arquivar`);
  refreshCatalog(data.slug);
  redirect("/admin/produtos?ok=arquivado");
}

export async function publishProductAction(formData: FormData) {
  await requireAdminRole(["admin", "editor"], "/admin/produtos");
  const id = uuidValue(formData, "id");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({ status: "active" })
    .eq("id", id)
    .eq("store_id", HELENA_STORE_ID)
    .select("slug")
    .maybeSingle();
  if (error || !data) redirect(`/admin/produtos/${id}?erro=publicar`);
  refreshCatalog(data.slug);
  redirect(`/admin/produtos/${id}?ok=publicado`);
}
