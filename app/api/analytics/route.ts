import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { HELENA_STORE_ID } from "@/types/commerce";

export const dynamic = "force-dynamic";

const EVENTS = new Set([
  "session_started",
  "page_view",
  "page_engagement",
  "category_view",
  "category_clicked",
  "product_impression",
  "product_view",
  "product_clicked",
  "search_performed",
  "search_zero_results",
  "filter_applied",
  "add_to_cart",
  "remove_from_cart",
  "cart_cleared",
  "cart_viewed",
  "quantity_changed",
  "begin_whatsapp_checkout",
  "checkout_product",
  "whatsapp_opened",
  "instagram_clicked",
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const rate = new Map<string, { count: number; since: number }>();

type CloudflareRequest = Request & {
  cf?: {
    city?: string | null;
    country?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    region?: string | null;
  };
};

function shortString(value: unknown, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function safeMetadata(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(input).slice(0, 20)) {
    if (!/^[a-z0-9_]{1,40}$/i.test(key)) continue;
    if (typeof value === "string") output[key] = value.slice(0, 180);
    else if (typeof value === "number" && Number.isFinite(value)) output[key] = value;
    else if (typeof value === "boolean" || value === null) output[key] = value;
  }
  return output;
}

function clientProfile(userAgent: string | null) {
  const ua = userAgent ?? "";
  const mobile = /Mobi|Android|iPhone/i.test(ua);
  const tablet = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const browser = /Edg\//.test(ua) ? "Edge"
    : /OPR\//.test(ua) ? "Opera"
      : /CriOS|Chrome\//.test(ua) ? "Chrome"
        : /FxiOS|Firefox\//.test(ua) ? "Firefox"
          : /Safari\//.test(ua) ? "Safari"
            : "Outro";
  const operatingSystem = /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
      : /Windows/.test(ua) ? "Windows"
        : /Mac OS X|Macintosh/.test(ua) ? "macOS"
          : /Linux/.test(ua) ? "Linux"
            : "Outro";
  return {
    browser,
    device: tablet ? "tablet" : mobile ? "mobile" : "desktop",
    operatingSystem,
  };
}

function cityGeo(request: CloudflareRequest) {
  const latitude = Number(request.cf?.latitude);
  const longitude = Number(request.cf?.longitude);
  return {
    city: shortString(request.cf?.city, 120),
    country: shortString(
      request.cf?.country ?? request.headers.get("cf-ipcountry"),
      2,
    )?.toUpperCase() ?? null,
    latitude: Number.isFinite(latitude) ? Math.round(latitude * 10) / 10 : null,
    longitude: Number.isFinite(longitude) ? Math.round(longitude * 10) / 10 : null,
    region: shortString(request.cf?.region, 120),
  };
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
  return current.count <= 100;
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
  const eventId = shortString(body.eventId, 36);
  const sessionId = shortString(body.sessionId, 36);
  const clientId = shortString(body.clientId, 36);
  const path = shortString(body.path, 500);
  if (
    !eventName || !EVENTS.has(eventName)
    || !eventId || !UUID.test(eventId)
    || !sessionId || !UUID.test(sessionId)
    || !clientId || !UUID.test(clientId)
    || !path || !path.startsWith("/")
  ) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }
  if (!rateAllowed(sessionId)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const productId = shortString(body.productId, 36);
  const categoryId = shortString(body.categoryId, 36);
  if ((productId && !UUID.test(productId)) || (categoryId && !UUID.test(categoryId))) {
    return NextResponse.json({ error: "invalid_reference" }, { status: 400 });
  }

  const profile = clientProfile(request.headers.get("user-agent"));
  const geo = cityGeo(request as CloudflareRequest);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("record_store_analytics_event", {
    p_browser: profile.browser,
    p_category_id: categoryId,
    p_city: geo.city,
    p_city_latitude: geo.latitude,
    p_city_longitude: geo.longitude,
    p_client_id: clientId,
    p_country_code: geo.country,
    p_device_class: profile.device,
    p_event_id: eventId,
    p_event_name: eventName,
    p_metadata: safeMetadata(body.metadata),
    p_operating_system: profile.operatingSystem,
    p_product_id: productId,
    p_referrer: shortString(body.referrer, 255),
    p_region: geo.region,
    p_route: path,
    p_session_id: sessionId,
    p_store_id: HELENA_STORE_ID,
    p_utm_campaign: shortString(body.utmCampaign, 200),
    p_utm_medium: shortString(body.utmMedium, 200),
    p_utm_source: shortString(body.utmSource, 200),
  });
  if (error || data !== true) {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
  return new NextResponse(null, { status: 204 });
}
