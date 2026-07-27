"use client";

import { useEffect } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";

export function FilterEvent({
  filters,
  resultCount,
}: {
  filters: Record<string, string | undefined>;
  resultCount: number;
}) {
  const serialized = JSON.stringify(filters);
  useEffect(() => {
    const values = JSON.parse(serialized) as Record<string, string | undefined>;
    if (values.busca) {
      void trackAnalyticsEvent({
        eventName: "search_performed",
        metadata: { query: values.busca, result_count: resultCount },
      });
    }
    const applied = Object.entries(values).filter(([key, value]) => key !== "busca" && value);
    if (applied.length) {
      void trackAnalyticsEvent({
        eventName: "filter_applied",
        metadata: { filters: applied.map(([key]) => key).join(","), result_count: resultCount },
      });
    }
  }, [resultCount, serialized]);
  return null;
}
