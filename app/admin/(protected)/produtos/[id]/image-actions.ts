"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { integerValue, textValue, uuidValue } from "@/lib/admin/validation";
import {
  productImageAssets,
  uploadProductImage,
} from "@/lib/admin/product-images";
import { requireAdminRole } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID } from "@/types/commerce";

function refresh(productId: string) {
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/loja");
}

export async function uploadProductImageAction(formData: FormData) {
  const productId = uuidValue(formData, "productId");
  await requireAdminRole(["admin", "editor"], `/admin/produtos/${productId}`);
  const file = formData.get("image");
  if (!(file instanceof File)) redirect(`/admin/produtos/${productId}?erro=imagem`);
  try {
    await uploadProductImage({
      altText: textValue(formData, "altText", { max: 240 }),
      file,
      productId,
    });
  } catch {
    redirect(`/admin/produtos/${productId}?erro=imagem`);
  }
  refresh(productId);
  redirect(`/admin/produtos/${productId}?ok=imagem`);
}

export async function setPrimaryImageAction(formData: FormData) {
  const productId = uuidValue(formData, "productId");
  const imageId = uuidValue(formData, "imageId");
  await requireAdminRole(["admin", "editor"], `/admin/produtos/${productId}`);
  await productImageAssets(imageId, productId);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("set_product_cover", {
    target_image_id: imageId,
    target_product_id: productId,
  });
  if (error) redirect(`/admin/produtos/${productId}?erro=capa`);
  refresh(productId);
  redirect(`/admin/produtos/${productId}?ok=capa`);
}

export async function updateImageOrderAction(formData: FormData) {
  const productId = uuidValue(formData, "productId");
  const imageId = uuidValue(formData, "imageId");
  const sortOrder = integerValue(formData, "sortOrder", { max: 999 });
  await requireAdminRole(["admin", "editor"], `/admin/produtos/${productId}`);
  await productImageAssets(imageId, productId);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("product_images")
    .update({ sort_order: sortOrder })
    .eq("id", imageId)
    .eq("product_id", productId)
    .eq("store_id", HELENA_STORE_ID);
  if (error) redirect(`/admin/produtos/${productId}?erro=ordem`);
  refresh(productId);
  redirect(`/admin/produtos/${productId}?ok=ordem`);
}

export async function removeProductImageAction(formData: FormData) {
  const productId = uuidValue(formData, "productId");
  const imageId = uuidValue(formData, "imageId");
  await requireAdminRole(["admin", "editor"], `/admin/produtos/${productId}`);
  const { image, paths } = await productImageAssets(imageId, productId);
  const supabase = await createSupabaseServerClient();
  if (image.is_primary) {
    const { data: product } = await supabase
      .from("products")
      .select("status")
      .eq("id", productId)
      .eq("store_id", HELENA_STORE_ID)
      .maybeSingle();
    if (product?.status === "active" || product?.status === "sold_out") {
      redirect(`/admin/produtos/${productId}?erro=capa-publicada`);
    }
  }
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId)
    .eq("store_id", HELENA_STORE_ID);
  if (error) redirect(`/admin/produtos/${productId}?erro=remover-imagem`);
  await supabase.storage.from("catalog-products").remove(paths);
  refresh(productId);
  redirect(`/admin/produtos/${productId}?ok=imagem-removida`);
}
