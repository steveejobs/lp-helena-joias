"use client";

import { useEffect, useRef } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";

export function ProductAnalytics({
  categoryId,
  productId,
}: {
  categoryId: string | null;
  productId: string;
}) {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const article = marker.current?.closest<HTMLElement>("[data-product-id]");
    if (!article) return;
    let dwell: number | undefined;
    const seenKey = `helena.impression:${productId}`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          if (window.sessionStorage.getItem(seenKey) || dwell) return;
          dwell = window.setTimeout(() => {
            window.sessionStorage.setItem(seenKey, "1");
            void trackAnalyticsEvent({ categoryId, eventName: "product_impression", productId });
            observer.disconnect();
          }, 800);
        } else if (dwell) {
          window.clearTimeout(dwell);
          dwell = undefined;
        }
      },
      { threshold: [0.45] },
    );
    const clicked = () => {
      void trackAnalyticsEvent({ categoryId, eventName: "product_clicked", productId });
    };
    observer.observe(article);
    article.addEventListener("click", clicked);
    return () => {
      if (dwell) window.clearTimeout(dwell);
      observer.disconnect();
      article.removeEventListener("click", clicked);
    };
  }, [categoryId, productId]);

  return <span ref={marker} hidden />;
}
