"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = [
  ".shop-categories",
  ".featured-products",
  ".catalog-section",
  ".shop-assistance",
  ".category-products",
  ".product-detail",
  ".related-products",
  ".cart-page-heading",
  ".cart-page-layout",
].join(",");

export function StoreMotion() {
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".store-shell");
    if (!shell || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let observer: IntersectionObserver | undefined;
    let revealFrame = 0;
    let targets: HTMLElement[] = [];

    // The store page is streamed by Next. Waiting for hydration avoids changing
    // server-rendered attributes while React is still reconciling the catalog.
    const startTimer = window.setTimeout(() => {
      const sections = Array.from(shell.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
      const details = Array.from(
        shell.querySelectorAll<HTMLElement>(".category-rail > a, .product-card"),
      );
      targets = [...sections, ...details];

      sections.forEach((element) => element.setAttribute("data-store-motion", "section"));
      details.forEach((element) => element.setAttribute("data-store-motion", "item"));
      shell.classList.add("store-motion-ready");

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("is-store-visible", entry.isIntersecting);
          });
        },
        { rootMargin: "-5% 0px -7%", threshold: 0 },
      );

      targets.forEach((element) => observer?.observe(element));
      revealFrame = window.requestAnimationFrame(() => {
        targets.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const visible = rect.bottom > window.innerHeight * .05 && rect.top < window.innerHeight * .93;
          element.classList.toggle("is-store-visible", visible);
        });
      });
    }, 1100);

    return () => {
      window.clearTimeout(startTimer);
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
      observer?.disconnect();
      shell.classList.remove("store-motion-ready");
      targets.forEach((element) => {
        element.classList.remove("is-store-visible");
        element.removeAttribute("data-store-motion");
      });
    };
  }, []);

  return null;
}
