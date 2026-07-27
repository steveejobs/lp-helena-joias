import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { HELENA_STORE_ID } from "@/types/commerce";

export const dynamic = "force-dynamic";

const EVENTS = new Set([
  "session_started",
  "page_view",
  "category_view",
  "category_clicked",
  "product_impression",
  "product_view",
  "product_clicked",
  "search_performed",
  "filter_applied",
  "add_to_cart",
  "remove_from_cart",
  "cart_viewed",
  "quantity_changed",
  "begin_whatsapp_checkout",
  "whatsapp_opened",
  "instagram_clicked",
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const rate = new Map<string, { count: number; since: number }>();

function shortString(value: unknown, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function safeMetadata(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(input).slice(0, 16)) {
    if (!/^[a-z0-9_]{1,40}$/i.test(key)) continue;
    if (typeof value === "string") output[key] = value.slice(0, 160);
    else if (typeof value === "number" && Number.isFinite(value)) output[key] = value;
    else if (typeof value === "boolean" || value === null) output[key] = value;
  }
  return output;
}

function genericDevice(userAgent: string | null) {
  const ua = userAgent?.toLowerCase() ?? "";
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|android|iphone/.test(ua)) return "mobile";
  return "desktop";
}

function rateAllowed(sessionId: string) {
  const now = Date.now();
  const current = rate.get(sessionId);
  if (!current || now - current.since > 60_000) {
    rate.set(sessionId, { count: 1, since: now });
    return true;
  }
  current.count += 1;
  if (rate.size > 2_000) {
    for (const [key, value] of rate) if (now - value.since > 120_000) rate.delete(key);
  }
  return current.count <= 80;
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) return new NextResponse(null, { status: 202 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventName = shortString(body.eventName, 60);
  const sessionId = shortString(body.sessionId, 36);
  const path = shortString(body.path, 500);
  if (!eventName || !EVENTS.has(eventName) || !sessionId || !UUID.test(sessionId) || !path || !path.startsWith("/")) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }
  if (!rateAllowed(sessionId)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const productId = shortString(body.productId, 36);
  const categoryId = shortString(body.categoryId, 36);
  if ((productId && !UUID.test(productId)) || (categoryId && !UUID.test(categoryId))) {
    return NextResponse.json({ error: "invalid_reference" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (productId) {
    const { data } = await supabase.from("products").select("id").eq("id", productId).eq("store_id", HELENA_STORE_ID).maybeSingle();
    if (!data) return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }
  if (categoryId) {
    const { data } = await supabase.from("categories").select("id").eq("id", categoryId).eq("store_id", HELENA_STORE_ID).maybeSingle();
    if (!data) return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  }

  const metadata = {
    ...safeMetadata(body.metadata),
    device: genericDevice(request.headers.get("user-agent")),
  };
  const { error } = await supabase.from("analytics_events").insert({
    anonymous_session_id: sessionId,
    category_id: categoryId,
    event_name: eventName,
    metadata,
    product_id: productId,
    referrer: shortString(body.referrer, 255),
    referrer_domain: shortString(body.referrer, 255),
    route: path,
    session_id: sessionId,
    store_id: HELENA_STORE_ID,
    utm_campaign: shortString(body.utmCampaign, 200),
    utm_medium: shortString(body.utmMedium, 200),
    utm_source: shortString(body.utmSource, 200),
  });
  if (error) return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  return new NextResponse(null, { status: 204 });
}
