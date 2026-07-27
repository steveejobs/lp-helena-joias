"use client";

import { useEffect, useRef } from "react";

export function StoreButterfly() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const sprite = new window.Image();
    let frameRequest = 0;
    let active = false;
    let loaded = false;
    let lastFrame = -1;

    const draw = (frame: number) => {
      if (!loaded || frame === lastFrame) return;
      const column = frame % 4;
      const row = Math.floor(frame / 4);
      context.clearRect(0, 0, 256, 256);
      context.drawImage(sprite, column * 512, row * 512, 512, 512, 0, 0, 256, 256);
      lastFrame = frame;
    };

    const animate = (time: number) => {
      draw(Math.floor(time / 94) % 16);
      if (active) frameRequest = window.requestAnimationFrame(animate);
    };

    const setActive = (next: boolean) => {
      active = next && !reduced && !connection?.saveData && document.visibilityState === "visible";
      if (active && !frameRequest) frameRequest = window.requestAnimationFrame(animate);
      if (!active && frameRequest) {
        window.cancelAnimationFrame(frameRequest);
        frameRequest = 0;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "120px" },
    );

    const handleVisibility = () => setActive(wrapper.getBoundingClientRect().top < window.innerHeight + 120);

    sprite.onload = () => {
      loaded = true;
      draw(0);
    };
    sprite.src = "/media/butterfly-scroll-sprite-v2.webp";
    observer.observe(wrapper);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (frameRequest) window.cancelAnimationFrame(frameRequest);
    };
  }, []);

  return (
    <div className="store-butterfly" ref={wrapperRef} aria-hidden="true">
      <canvas ref={canvasRef} width="256" height="256" />
    </div>
  );
}
