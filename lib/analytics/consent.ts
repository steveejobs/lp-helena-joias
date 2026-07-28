"use client";

export const ANALYTICS_CONSENT_KEY = "helena.analytics.consent.v1";
export const ANALYTICS_CONSENT_EVENT = "helena:analytics-consent";
export const OPEN_COOKIE_SETTINGS_EVENT = "helena:open-cookie-settings";

export type AnalyticsConsent = "accepted" | "necessary";

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function getAnalyticsConsent(): AnalyticsConsent | null {
  try {
    const stored = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return stored === "accepted" || stored === "necessary" ? stored : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  return getAnalyticsConsent() === "accepted";
}

function updateGoogleConsent(choice: AnalyticsConsent) {
  const target = window as GtagWindow;
  target.dataLayer = target.dataLayer ?? [];
  target.gtag = target.gtag ?? function gtag(...args: unknown[]) {
    target.dataLayer?.push(args);
  };
  target.gtag("consent", "update", {
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: choice === "accepted" ? "granted" : "denied",
  });
}

function clearAnalyticsIdentifiers() {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("helena.analytics.")) window.localStorage.removeItem(key);
    }
    for (const key of Object.keys(window.sessionStorage)) {
      if (key.startsWith("helena.analytics.") || key.startsWith("helena.impression:")) {
        window.sessionStorage.removeItem(key);
      }
    }
  } catch {
    // Storage can be blocked by the browser; consent is still updated in memory.
  }

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || (name !== "_ga" && !name.startsWith("_ga_"))) continue;
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}

export function saveAnalyticsConsent(choice: AnalyticsConsent) {
  if (choice === "necessary") clearAnalyticsIdentifiers();
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, choice);
  } catch {
    // The current page still receives the consent update when storage is unavailable.
  }
  updateGoogleConsent(choice);
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: choice }));
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
