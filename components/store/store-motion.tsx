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

    const targets = new Set<HTMLElement>();
    let revealFrame = 0;
    let initialPass = true;

    const reveal = (element: HTMLElement) => {
      element.classList.add("is-store-visible");
      observer.unobserve(element);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        });
      },
      { rootMargin: "2% 0px -8%", threshold: .04 },
    );

    const register = () => {
      revealFrame = 0;
      const sections = Array.from(shell.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
      const details = Array.from(shell.querySelectorAll<HTMLElement>(".category-rail > a, .product-card"));

      sections.forEach((element) => {
        if (!element.dataset.storeMotion) element.dataset.storeMotion = "section";
      });
      details.forEach((element) => {
        if (!element.dataset.storeMotion) element.dataset.storeMotion = "item";
      });

      [...sections, ...details].forEach((element) => {
        if (targets.has(element)) return;
        targets.add(element);
        const rect = element.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight * .94;

        if (initialPass && visible) element.classList.add("is-store-visible");
        else {
          observer.observe(element);
          if (visible) window.requestAnimationFrame(() => reveal(element));
        }
      });

      if (initialPass) {
        shell.classList.add("store-motion-ready");
        initialPass = false;
      }
    };

    const requestRegister = () => {
      if (!revealFrame) revealFrame = window.requestAnimationFrame(register);
    };

    register();
    const mutationObserver = new MutationObserver(requestRegister);
    mutationObserver.observe(shell, { childList: true, subtree: true });

    return () => {
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
      observer.disconnect();
      mutationObserver.disconnect();
      shell.classList.remove("store-motion-ready");
      targets.forEach((element) => {
        element.classList.remove("is-store-visible");
      });
    };
  }, []);

  return null;
}
