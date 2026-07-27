"use client";

import { useEffect, useRef } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";

export function CategoryInteraction({ categoryId }: { categoryId: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const link = marker.current?.closest("a");
    if (!link) return;
    const clicked = () => void trackAnalyticsEvent({ categoryId, eventName: "category_clicked" });
    link.addEventListener("click", clicked);
    return () => link.removeEventListener("click", clicked);
  }, [categoryId]);
  return <span ref={marker} hidden />;
}
