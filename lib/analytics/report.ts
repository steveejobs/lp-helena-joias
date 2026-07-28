import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AnalyticsPeriod = {
  end: Date;
  key: string;
  label: string;
  start: Date;
};

export const ACTIVE_WINDOW_OPTIONS = [5, 15, 30, 60] as const;
export type ActiveWindowMinutes = (typeof ACTIVE_WINDOW_OPTIONS)[number];

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
  const allowedPeriods = new Set(["today", "yesterday", "7", "30", "90", "180", "365", "custom"]);
  let key = input.period && allowedPeriods.has(input.period) ? input.period : "30";
  if (key === "custom" && input.start && input.end) {
    const customStart = parseDateInput(input.start, false);
    const customEnd = parseDateInput(input.end, true);
    const days = customStart && customEnd
      ? (customEnd.getTime() - customStart.getTime()) / 86_400_000
      : Number.NaN;
    if (customStart && customEnd && Number.isFinite(days) && days >= 0 && days <= 366) {
      return { end: customEnd, key, label: `${input.start} a ${input.end}`, start: customStart };
    }
  }
  if (key === "custom") key = "30";

  const todayStart = saoPauloDayStart(now);
  if (key === "today") {
    return { end, key, label: "Hoje", start: todayStart };
  }
  if (key === "yesterday") {
    return {
      end: new Date(todayStart.getTime() - 1),
      key,
      label: "Ontem",
      start: new Date(todayStart.getTime() - 86_400_000),
    };
  }

  const days = Number(key);
  const start = new Date(now);
  start.setTime(now.getTime() - days * 86_400_000);
  return {
    end,
    key,
    label: `Últimos ${days} dias`,
    start,
  };
}

export function resolveActiveWindow(value?: string): ActiveWindowMinutes {
  const minutes = Number(value);
  return ACTIVE_WINDOW_OPTIONS.includes(minutes as ActiveWindowMinutes)
    ? minutes as ActiveWindowMinutes
    : 5;
}

export async function getAnalyticsReport(
  period: AnalyticsPeriod,
  activeWindowMinutes: ActiveWindowMinutes,
): Promise<AnalyticsReport> {
  const supabase = await createSupabaseServerClient();
  const activeSince = new Date(Date.now() - activeWindowMinutes * 60_000);
  const [{ data, error }, activeResult] = await Promise.all([
    supabase.rpc("admin_store_analytics_v2", {
      p_end: period.end.toISOString(),
      p_start: period.start.toISOString(),
    }),
    supabase
      .from("analytics_sessions")
      .select("session_id", { count: "exact", head: true })
      .gte("last_seen_at", activeSince.toISOString()),
  ]);
  if (error || activeResult.error) {
    throw new Error("Não foi possível consultar o analytics da loja.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return EMPTY_REPORT;
  const report = data as Partial<AnalyticsReport>;
  return {
    ...EMPTY_REPORT,
    ...report,
    overview: {
      ...EMPTY_REPORT.overview,
      ...report.overview,
      realtime: activeResult.count ?? 0,
    },
  };
}

function saoPauloDayStart(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00-03:00`);
}

function parseDateInput(value: string, endOfDay: boolean) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDate.getUTCFullYear() !== year
    || calendarDate.getUTCMonth() !== month - 1
    || calendarDate.getUTCDate() !== day
  ) {
    return null;
  }
  return new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}-03:00`);
}
