"use client";

import { hasAnalyticsConsent } from "./consent";

export type AnalyticsEventPayload = {
  categoryId?: string | null;
  eventName: string;
  metadata?: Record<string, unknown>;
  path?: string;
  productId?: string | null;
};

type AnalyticsContext = {
  clientId: string;
  sessionId: string;
};

type Attribution = {
  referrer?: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmSource?: string;
};

const CLIENT_KEY = "helena.analytics.client.v2";
const SESSION_KEY = "helena.analytics.session.v2";
const ATTRIBUTION_KEY = "helena.analytics.attribution.v2";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validUuid(value: string | null): value is string {
  return Boolean(value && UUID.test(value));
}

function clientId() {
  const stored = window.localStorage.getItem(CLIENT_KEY);
  if (validUuid(stored)) return stored;
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(CLIENT_KEY, created);
  return created;
}

function sessionId(): string {
  const now = Date.now();
  try {
    const stored = JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null") as {
      id?: string;
      lastActivity?: number;
    } | null;
    if (
      validUuid(stored?.id ?? null)
      && typeof stored?.lastActivity === "number"
      && now - stored.lastActivity < SESSION_TIMEOUT_MS
    ) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ id: stored.id, lastActivity: now }));
      return stored.id as string;
    }
  } catch {
    // A malformed browser value is replaced below.
  }
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ id: created, lastActivity: now }));
  window.sessionStorage.removeItem(ATTRIBUTION_KEY);
  return created;
}

export function getAnalyticsContext(): AnalyticsContext {
  return { clientId: clientId(), sessionId: sessionId() };
}

export function getAnalyticsSessionId() {
  return getAnalyticsContext().sessionId;
}

function currentAttribution(): Attribution {
  const query = new URLSearchParams(window.location.search);
  let referrer: string | undefined;
  try {
    referrer = document.referrer ? new URL(document.referrer).hostname : undefined;
  } catch {
    referrer = undefined;
  }
  return {
    referrer,
    utmCampaign: query.get("utm_campaign") ?? undefined,
    utmMedium: query.get("utm_medium") ?? undefined,
    utmSource: query.get("utm_source") ?? undefined,
  };
}

function attribution(): Attribution {
  const current = currentAttribution();
  const hasCampaign = current.utmCampaign || current.utmMedium || current.utmSource;
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) ?? "null") as Attribution | null;
    if (stored && !hasCampaign) return stored;
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(current));
  } catch {
    // Storage can be unavailable in privacy modes; current attribution still works.
  }
  return current;
}

function sendToGa4(payload: AnalyticsEventPayload, context: AnalyticsContext) {
  const gtag = (window as Window & {
    gtag?: (...args: unknown[]) => void;
  }).gtag;
  if (!gtag) return;
  gtag("event", payload.eventName, {
    category_id: payload.categoryId ?? undefined,
    engagement_time_msec: payload.metadata?.engagement_ms,
    page_path: payload.path ?? window.location.pathname,
    product_id: payload.productId ?? undefined,
    session_id: context.sessionId,
    ...payload.metadata,
  });
}

export async function trackAnalyticsEvent(payload: AnalyticsEventPayload) {
  if (!hasAnalyticsConsent()) return false;
  const context = getAnalyticsContext();
  sendToGa4({ ...payload, metadata: { ...attribution(), ...payload.metadata } }, context);
  return true;
}
