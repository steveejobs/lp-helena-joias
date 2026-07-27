"use client";

import { useEffect } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";

export function PageEvent({
  categoryId,
  eventName,
  productId,
}: {
  categoryId?: string | null;
  eventName: "category_view" | "product_view" | "cart_viewed";
  productId?: string | null;
}) {
  useEffect(() => {
    void trackAnalyticsEvent({ categoryId, eventName, productId });
  }, [categoryId, eventName, productId]);
  return null;
}
