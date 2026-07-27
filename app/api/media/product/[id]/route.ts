import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolveStoreContext } from "@/lib/store/context";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_PATH =
  /^stores\/[0-9a-f-]{36}\/products\/[0-9a-f-]{36}\/[a-zA-Z0-9._-]+\.(?:jpe?g|png|webp|avif)$/;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return new NextResponse(null, { status: 404 });
  const context = await resolveStoreContext();
  const supabase = createSupabaseAdminClient();
  const { data: image, error } = await supabase
    .from("product_images")
    .select("id,store_id,product_id,storage_path,mime_type,asset_version")
    .eq("id", id)
    .eq("store_id", context.id)
    .maybeSingle();
  if (error || !image) return new NextResponse(null, { status: 404 });

  const expectedPrefix = `stores/${context.id}/products/${image.product_id}/`;
  if (
    !image.storage_path.startsWith(expectedPrefix) ||
    !SAFE_PATH.test(image.storage_path) ||
    image.storage_path.includes("..")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", image.product_id)
    .eq("store_id", context.id)
    .in("status", ["active", "sold_out"])
    .maybeSingle();
  if (!product) return new NextResponse(null, { status: 404 });

  const { data: blob, error: storageError } = await supabase.storage
    .from("catalog-products")
    .download(image.storage_path);
  if (storageError || !blob || !ALLOWED_MIME.has(blob.type)) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(blob, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": blob.type,
      ETag: `"${image.asset_version}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
