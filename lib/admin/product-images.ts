import "server-only";

import { randomUUID } from "node:crypto";

import { requireAdminRole } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID } from "@/types/commerce";

const BUCKET = "catalog-products";
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 2_400;
const WEBP_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50];
const NEUTRAL_BLUR =
  "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAA==";

function hasBytes(bytes: Uint8Array, expected: readonly number[], offset = 0) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function uint24le(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function uint16le(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

function webpDimensions(bytes: Uint8Array) {
  const chunk = ascii(bytes, 12, 16);
  if (chunk === "VP8X" && bytes.length >= 30) {
    return { width: uint24le(bytes, 24) + 1, height: uint24le(bytes, 27) + 1 };
  }
  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    const b1 = bytes[21];
    const b2 = bytes[22];
    const b3 = bytes[23];
    const b4 = bytes[24];
    return {
      width: 1 + b1 + ((b2 & 0x3f) << 8),
      height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
    };
  }
  if (chunk === "VP8 " && bytes.length >= 30 && hasBytes(bytes, [0x9d, 0x01, 0x2a], 23)) {
    return {
      width: uint16le(bytes, 26) & 0x3fff,
      height: uint16le(bytes, 28) & 0x3fff,
    };
  }
  return null;
}

async function validateWebP(file: File, productId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(productId)) throw new Error("Produto inválido.");
  if (file.type !== "image/webp" || file.name.split(".").pop()?.toLowerCase() !== "webp") {
    throw new Error("Neste ambiente, envie uma imagem WebP.");
  }
  if (!file.size || file.size > MAX_BYTES) throw new Error("A imagem deve ter no máximo 4 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasBytes(bytes, WEBP_SIGNATURE) || !hasBytes(bytes, WEBP_MARKER, 8)) {
    throw new Error("O conteúdo do arquivo não é WebP válido.");
  }
  const dimensions = webpDimensions(bytes);
  if (
    !dimensions ||
    dimensions.width < 320 ||
    dimensions.height < 320 ||
    dimensions.width > MAX_DIMENSION ||
    dimensions.height > MAX_DIMENSION
  ) {
    throw new Error("Use WebP entre 320 e 2400 pixels por lado.");
  }
  return {
    bytes,
    height: dimensions.height,
    path: `stores/${HELENA_STORE_ID}/products/${productId}/${randomUUID()}.webp`,
    width: dimensions.width,
  };
}

async function assertProduct(productId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,name,status")
    .eq("id", productId)
    .eq("store_id", HELENA_STORE_ID)
    .maybeSingle();
  if (error || !data) throw new Error("Produto inválido para esta loja.");
  return data;
}

export async function uploadProductImage(input: {
  altText: string;
  file: File;
  productId: string;
}) {
  await requireAdminRole(["admin", "editor"], `/admin/produtos/${input.productId}`);
  const product = await assertProduct(input.productId);
  const altText = input.altText.trim();
  if (!altText || altText.length > 240) throw new Error("Informe um texto alternativo válido.");
  const asset = await validateWebP(input.file, product.id);
  const supabase = await createSupabaseServerClient();
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(asset.path, asset.bytes, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });
  if (uploadError) throw new Error("Não foi possível armazenar a imagem.");

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", product.id)
    .eq("store_id", HELENA_STORE_ID);
  const { data, error } = await supabase
    .from("product_images")
    .insert({
      alt_text: altText,
      asset_version: randomUUID(),
      blur_data_url: NEUTRAL_BLUR,
      display_order: count ?? 0,
      height: asset.height,
      is_cover: (count ?? 0) === 0,
      is_primary: (count ?? 0) === 0,
      mime_type: "image/webp",
      product_id: product.id,
      size_bytes: asset.bytes.byteLength,
      sort_order: count ?? 0,
      storage_path: asset.path,
      store_id: HELENA_STORE_ID,
      width: asset.width,
    })
    .select("id")
    .single();
  if (error || !data) {
    await supabase.storage.from(BUCKET).remove([asset.path]);
    throw new Error("Não foi possível vincular a imagem ao produto.");
  }
  return data.id;
}

export async function adminImageUrls(paths: string[]): Promise<Map<string, string>> {
  await requireAdminRole(["admin", "editor"]);
  if (!paths.length) return new Map();
  const expected = `stores/${HELENA_STORE_ID}/products/`;
  const safePaths = paths.filter((path) => path.startsWith(expected) && !path.includes(".."));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(safePaths, 900);
  if (error) return new Map();
  const entries: Array<[string, string]> = [];
  for (const item of data) {
    if (item.path && item.signedUrl) entries.push([item.path, item.signedUrl]);
  }
  return new Map(entries);
}

export async function productImageAssets(imageId: string, productId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("id,storage_path,is_primary")
    .eq("id", imageId)
    .eq("product_id", productId)
    .eq("store_id", HELENA_STORE_ID)
    .maybeSingle();
  if (!image) throw new Error("Imagem não pertence a este produto.");
  const { data: derived } = await supabase
    .from("product_image_variants")
    .select("storage_path")
    .eq("product_image_id", imageId)
    .eq("store_id", HELENA_STORE_ID);
  return { image, paths: [image.storage_path, ...(derived ?? []).map((item) => item.storage_path)] };
}
