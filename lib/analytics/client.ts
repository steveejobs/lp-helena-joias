"use client";

export type AnalyticsEventPayload = {
  categoryId?: string | null;
  eventName: string;
  metadata?: Record<string, unknown>;
  path?: string;
  productId?: string | null;
};

const SESSION_KEY = "helena.analytics.session";

export function getAnalyticsSessionId() {
  let sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    sessionId = window.crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function attribution() {
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

export async function trackAnalyticsEvent(payload: AnalyticsEventPayload) {
  try {
    await fetch("/api/analytics", {
      body: JSON.stringify({
        ...payload,
        ...attribution(),
        path: payload.path ?? window.location.pathname,
        sessionId: getAnalyticsSessionId(),
      }),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      method: "POST",
    });
  } catch {
    // Analytics must never block the shopping experience.
  }
}
