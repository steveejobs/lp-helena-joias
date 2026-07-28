"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getAnalyticsSessionId, trackAnalyticsEvent } from "@/lib/analytics/client";
import {
  ANALYTICS_CONSENT_EVENT,
  hasAnalyticsConsent,
} from "@/lib/analytics/consent";

const ENGAGEMENT_FLUSH_MS = 15_000;

export function AnalyticsRuntime() {
  const pathname = usePathname();
  const lastPageView = useRef<{ at: number; path: string } | null>(null);
  const [consentRevision, setConsentRevision] = useState(0);

  useEffect(() => {
    const consentChanged = () => setConsentRevision((current) => current + 1);
    window.addEventListener(ANALYTICS_CONSENT_EVENT, consentChanged);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, consentChanged);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin") || !hasAnalyticsConsent()) return;
    const sessionId = getAnalyticsSessionId();
    const startedKey = `helena.analytics.started:${sessionId}`;
    if (!window.localStorage.getItem(startedKey)) {
      window.localStorage.setItem(startedKey, "1");
      void trackAnalyticsEvent({ eventName: "session_started", path: pathname });
    }

    const now = Date.now();
    if (
      !lastPageView.current
      || lastPageView.current.path !== pathname
      || now - lastPageView.current.at > 1_000
    ) {
      lastPageView.current = { at: now, path: pathname };
      void trackAnalyticsEvent({ eventName: "page_view", path: pathname });
    }

    let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
    let accumulated = 0;

    const collect = () => {
      if (visibleSince === null) return;
      accumulated += performance.now() - visibleSince;
      visibleSince = performance.now();
    };
    const flush = (beacon = false) => {
      collect();
      const engagementMs = Math.round(accumulated);
      accumulated = 0;
      if (engagementMs < 1_000) return;
      void trackAnalyticsEvent(
        {
          eventName: "page_engagement",
          metadata: { engagement_ms: Math.min(engagementMs, 60_000) },
          path: pathname,
        },
        { beacon },
      );
    };
    const visibilityChanged = () => {
      if (document.visibilityState === "hidden") {
        flush(true);
        visibleSince = null;
      } else {
        visibleSince = performance.now();
      }
    };
    const pageHidden = () => {
      flush(true);
      visibleSince = null;
    };
    const interval = window.setInterval(() => flush(), ENGAGEMENT_FLUSH_MS);
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("pagehide", pageHidden);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("pagehide", pageHidden);
      flush(true);
      visibleSince = null;
    };
  }, [consentRevision, pathname]);

  return null;
}
