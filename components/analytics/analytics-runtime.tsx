"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { getAnalyticsSessionId, trackAnalyticsEvent } from "@/lib/analytics/client";

export function AnalyticsRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId = getAnalyticsSessionId();
    const startedKey = `helena.analytics.started:${sessionId}`;
    if (!window.sessionStorage.getItem(startedKey)) {
      window.sessionStorage.setItem(startedKey, "1");
      void trackAnalyticsEvent({ eventName: "session_started", path: pathname });
    }
    void trackAnalyticsEvent({ eventName: "page_view", path: pathname });
  }, [pathname]);

  return null;
}
