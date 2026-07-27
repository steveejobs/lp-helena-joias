import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID } from "@/types/commerce";

type RawEvent = {
  category_id: string | null;
  created_at: string;
  event_name: string;
  metadata: Record<string, unknown>;
  product_id: string | null;
  referrer: string | null;
  route: string;
  session_id: string;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_source: string | null;
};

function countBy(values: Array<string | null | undefined>) {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function namesFor(rows: Array<[string, number]>, names: Map<string, string>) {
  return rows.slice(0, 8).map(([id, count]) => ({ count, id, label: names.get(id) ?? "Item removido" }));
}

export type AnalyticsPeriod = {
  end: Date;
  key: string;
  label: string;
  start: Date;
};

export function resolveAnalyticsPeriod(input: {
  end?: string;
  period?: string;
  start?: string;
}): AnalyticsPeriod {
  const now = new Date();
  const end = new Date(now);
  const key = input.period ?? "7";
  if (key === "custom" && input.start && input.end) {
    const customStart = new Date(`${input.start}T00:00:00-03:00`);
    const customEnd = new Date(`${input.end}T23:59:59.999-03:00`);
    const days = (customEnd.getTime() - customStart.getTime()) / 86_400_000;
    if (Number.isFinite(days) && days >= 0 && days <= 366) {
      return { end: customEnd, key, label: `${input.start} a ${input.end}`, start: customStart };
    }
  }
  const days = key === "today" ? 1 : key === "30" ? 30 : 7;
  const start = new Date(now);
  if (key === "today") {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Sao_Paulo",
      year: "numeric",
    });
    const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
    start.setTime(new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00-03:00`).getTime());
  } else {
    start.setTime(now.getTime() - days * 86_400_000);
  }
  return {
    end,
    key,
    label: key === "today" ? "Hoje" : `Últimos ${days} dias`,
    start,
  };
}

export async function getAnalyticsReport(period: AnalyticsPeriod) {
  const supabase = await createSupabaseServerClient();
  const duration = period.end.getTime() - period.start.getTime();
  const previousStart = new Date(period.start.getTime() - duration);
  const [currentResult, previousResult] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("event_name,product_id,category_id,route,session_id,metadata,referrer,utm_source,utm_medium,utm_campaign,created_at")
      .eq("store_id", HELENA_STORE_ID)
      .gte("created_at", period.start.toISOString())
      .lte("created_at", period.end.toISOString())
      .order("created_at", { ascending: false })
      .limit(20_000),
    supabase
      .from("analytics_events")
      .select("event_name,session_id")
      .eq("store_id", HELENA_STORE_ID)
      .gte("created_at", previousStart.toISOString())
      .lt("created_at", period.start.toISOString())
      .limit(20_000),
  ]);
  if (currentResult.error || previousResult.error) throw new Error("Não foi possível consultar os eventos.");
  const events = (currentResult.data ?? []) as RawEvent[];
  const previous = previousResult.data ?? [];
  const productIds = [...new Set(events.flatMap((event) => event.product_id ? [event.product_id] : []))];
  const categoryIds = [...new Set(events.flatMap((event) => event.category_id ? [event.category_id] : []))];
  const [productResult, categoryResult] = await Promise.all([
    productIds.length
      ? supabase.from("products").select("id,name").eq("store_id", HELENA_STORE_ID).in("id", productIds)
      : Promise.resolve({ data: [] }),
    categoryIds.length
      ? supabase.from("categories").select("id,name").eq("store_id", HELENA_STORE_ID).in("id", categoryIds)
      : Promise.resolve({ data: [] }),
  ]);
  const productNames = new Map((productResult.data ?? []).map((item) => [item.id, item.name]));
  const categoryNames = new Map((categoryResult.data ?? []).map((item) => [item.id, item.name]));
  const eventCount = (name: string) => events.filter((event) => event.event_name === name).length;
  const visits = eventCount("page_view");
  const sessions = new Set(events.map((event) => event.session_id)).size;
  const productViews = eventCount("product_view");
  const cartSessions = new Set(events.filter((event) => event.event_name === "add_to_cart").map((event) => event.session_id)).size;
  const whatsappSessions = new Set(events.filter((event) => event.event_name === "begin_whatsapp_checkout").map((event) => event.session_id)).size;
  const previousVisits = previous.filter((event) => event.event_name === "page_view").length;
  const previousSessions = new Set(previous.map((event) => event.session_id)).size;
  const productRows = (name: string) =>
    namesFor(countBy(events.filter((event) => event.event_name === name).map((event) => event.product_id)), productNames);
  const searches = countBy(
    events
      .filter((event) => event.event_name === "search_performed")
      .map((event) => typeof event.metadata?.query === "string" ? event.metadata.query.toLowerCase() : null),
  ).slice(0, 8).map(([label, count]) => ({ label, count }));

  return {
    categories: namesFor(
      countBy(events.filter((event) => event.event_name === "category_view").map((event) => event.category_id)),
      categoryNames,
    ),
    cartSessions,
    events: events.length,
    productAdded: productRows("add_to_cart"),
    productClicked: productRows("product_clicked"),
    productViews,
    productViewed: productRows("product_view"),
    rates: {
      cartToWhatsapp: cartSessions ? (whatsappSessions / cartSessions) * 100 : 0,
      viewToCart: productViews ? (eventCount("add_to_cart") / productViews) * 100 : 0,
    },
    searches,
    sessions,
    sources: countBy(events.map((event) => event.utm_source ?? event.referrer ?? "Direto"))
      .slice(0, 10)
      .map(([label, count]) => ({ label, count })),
    utmCampaigns: countBy(events.map((event) => event.utm_campaign))
      .slice(0, 8)
      .map(([label, count]) => ({ label, count })),
    visits,
    whatsappClicks: eventCount("whatsapp_opened"),
    whatsappSessions,
    comparison: {
      sessions: previousSessions,
      visits: previousVisits,
    },
  };
}
