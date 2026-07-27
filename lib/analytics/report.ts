import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AnalyticsPeriod = {
  end: Date;
  key: string;
  label: string;
  start: Date;
};

export type CountRow = { count: number; label: string };
export type CityRow = {
  city: string;
  country_code: string | null;
  latitude: number;
  longitude: number;
  region: string | null;
  sessions: number;
};
export type ProductAnalyticsRow = {
  additions: number;
  clicks: number;
  id: string;
  impressions: number;
  label: string;
  views: number;
  whatsapp_intents: number;
};
export type AnalyticsReport = {
  browsers: CountRow[];
  campaigns: CountRow[];
  categories: Array<CountRow & { id: string }>;
  cities: CityRow[];
  comparison: { sessions: number; visits: number };
  daily: Array<{
    additions: number;
    day: string;
    sessions: number;
    views: number;
    whatsapp: number;
  }>;
  devices: CountRow[];
  entries: CountRow[];
  exits: CountRow[];
  funnel: {
    abandoned: number;
    cart: number;
    opened: number;
    viewed: number;
    whatsapp: number;
  };
  operatingSystems: CountRow[];
  overview: {
    averageDurationMs: number;
    averageEngagedMs: number;
    events: number;
    newSessions: number;
    productViews: number;
    quickExits: number;
    realtime: number;
    returningSessions: number;
    sessions: number;
    visits: number;
    whatsappClicks: number;
    zeroResultSearches: number;
  };
  pages: CountRow[];
  products: ProductAnalyticsRow[];
  searches: Array<CountRow & { zero_results: number }>;
  sources: CountRow[];
};

const EMPTY_REPORT: AnalyticsReport = {
  browsers: [],
  campaigns: [],
  categories: [],
  cities: [],
  comparison: { sessions: 0, visits: 0 },
  daily: [],
  devices: [],
  entries: [],
  exits: [],
  funnel: { abandoned: 0, cart: 0, opened: 0, viewed: 0, whatsapp: 0 },
  operatingSystems: [],
  overview: {
    averageDurationMs: 0,
    averageEngagedMs: 0,
    events: 0,
    newSessions: 0,
    productViews: 0,
    quickExits: 0,
    realtime: 0,
    returningSessions: 0,
    sessions: 0,
    visits: 0,
    whatsappClicks: 0,
    zeroResultSearches: 0,
  },
  pages: [],
  products: [],
  searches: [],
  sources: [],
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

export async function getAnalyticsReport(period: AnalyticsPeriod): Promise<AnalyticsReport> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_store_analytics_v2", {
    p_end: period.end.toISOString(),
    p_start: period.start.toISOString(),
  });
  if (error) throw new Error("Não foi possível consultar o analytics da loja.");
  if (!data || typeof data !== "object" || Array.isArray(data)) return EMPTY_REPORT;
  return { ...EMPTY_REPORT, ...(data as AnalyticsReport) };
}
