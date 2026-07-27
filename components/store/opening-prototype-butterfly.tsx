"use client";

import { useEffect, useRef } from "react";

export function OpeningPrototypeButterfly({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const sprite = new window.Image();
    let request = 0;
    let lastFrame = -1;

    const draw = (frame: number) => {
      if (frame === lastFrame) return;
      const column = frame % 4;
      const row = Math.floor(frame / 4);
      context.clearRect(0, 0, 280, 280);
      context.drawImage(sprite, column * 512, row * 512, 512, 512, 0, 0, 280, 280);
      lastFrame = frame;
    };

    const animate = (time: number) => {
      draw(Math.floor(time / 96) % 16);
      request = window.requestAnimationFrame(animate);
    };

    sprite.onload = () => {
      draw(0);
      if (!reduced && !connection?.saveData) request = window.requestAnimationFrame(animate);
    };
    sprite.src = "/media/butterfly-scroll-sprite-v2.webp";

    return () => {
      if (request) window.cancelAnimationFrame(request);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} width="280" height="280" aria-hidden="true" />;
}
