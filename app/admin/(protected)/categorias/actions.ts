"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminRole } from "@/lib/auth/admin";
import { checked, integerValue, slugValue, textValue, uuidValue } from "@/lib/admin/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID, type CategoryIconKey } from "@/types/commerce";

const ICONS = new Set<CategoryIconKey>(["necklaces", "earrings", "bracelets", "rings", "sets"]);

function categoryPayload(formData: FormData) {
  const name = textValue(formData, "name", { max: 120 });
  const iconKey = String(formData.get("iconKey") ?? "") as CategoryIconKey;
  if (!ICONS.has(iconKey)) throw new Error("Ícone inválido.");
  return {
    active: checked(formData, "active"),
    description: textValue(formData, "description", { max: 500, optional: true }),
    display_order: integerValue(formData, "sortOrder", { max: 999 }),
    icon_key: iconKey,
    name,
    slug: slugValue(textValue(formData, "slug", { max: 120, optional: true }) ?? name),
    sort_order: integerValue(formData, "sortOrder", { max: 999 }),
  };
}

export async function createCategoryAction(formData: FormData) {
  await requireAdminRole(["admin", "editor"], "/admin/categorias");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").insert({
    ...categoryPayload(formData),
    store_id: HELENA_STORE_ID,
  });
  if (error) redirect("/admin/categorias?erro=salvar");
  revalidatePath("/admin/categorias");
  revalidatePath("/loja");
  redirect("/admin/categorias?ok=criada");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdminRole(["admin", "editor"], "/admin/categorias");
  const id = uuidValue(formData, "id");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("categories")
    .update(categoryPayload(formData))
    .eq("id", id)
    .eq("store_id", HELENA_STORE_ID);
  if (error) redirect("/admin/categorias?erro=salvar");
  revalidatePath("/admin/categorias");
  revalidatePath("/loja");
  redirect("/admin/categorias?ok=atualizada");
}

