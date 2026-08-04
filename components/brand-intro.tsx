"use client";

import { useEffect, useRef, useState } from "react";

type BrandIntroProps = {
  landingTargetSelector?: string;
  landingButterfly?: number;
};

export function BrandIntro({ landingTargetSelector, landingButterfly = 9 }: BrandIntroProps = {}) {
  const [hidden, setHidden] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intro = introRef.current;
    if (!intro || !landingTargetSelector) return;

    const flyer = intro.querySelector<HTMLElement>(`.brand-intro-butterfly-${landingButterfly}`);
    const target = document.querySelector<HTMLElement>(landingTargetSelector);
    if (!flyer || !target) return;

    let geometryFrame = 0;

    const updateLandingGeometry = () => {
      geometryFrame = 0;
      const flyerRect = flyer.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const x = targetRect.left + targetRect.width / 2 - (flyerRect.left + flyerRect.width / 2);
      const y = targetRect.top + targetRect.height / 2 - (flyerRect.top + flyerRect.height / 2);
      const distance = Math.max(Math.hypot(x, y), 1);
      const arc = Math.min(90, Math.max(32, distance * .18));
      let normalX = -y / distance;
      let normalY = x / distance;

      if (normalY > 0) {
        normalX *= -1;
        normalY *= -1;
      }

      flyer.style.setProperty("--intro-land-x", `${x.toFixed(2)}px`);
      flyer.style.setProperty("--intro-land-y", `${y.toFixed(2)}px`);
      flyer.style.setProperty("--intro-land-x-one", `${(x * .28 + normalX * arc).toFixed(2)}px`);
      flyer.style.setProperty("--intro-land-y-one", `${(y * .28 + normalY * arc).toFixed(2)}px`);
      flyer.style.setProperty("--intro-land-x-two", `${(x * .72 + normalX * arc * .6).toFixed(2)}px`);
      flyer.style.setProperty("--intro-land-y-two", `${(y * .72 + normalY * arc * .6).toFixed(2)}px`);
      flyer.style.setProperty("--intro-land-scale", String(target.offsetWidth / Math.max(flyer.offsetWidth, 1)));
    };

    const scheduleGeometryUpdate = () => {
      if (geometryFrame) window.cancelAnimationFrame(geometryFrame);
      geometryFrame = window.requestAnimationFrame(updateLandingGeometry);
    };

    flyer.classList.add("brand-intro-butterfly-landing");
    scheduleGeometryUpdate();
    window.addEventListener("resize", scheduleGeometryUpdate);

    return () => {
      window.removeEventListener("resize", scheduleGeometryUpdate);
      if (geometryFrame) window.cancelAnimationFrame(geometryFrame);
    };
  }, [landingButterfly, landingTargetSelector]);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let revealTimer = 0;
    let contentTimer = 0;
    let finishTimer = 0;
    let assetFallbackTimer = 0;
    let started = false;

    const revealContent = () => {
      root.classList.add("brand-intro-content-revealing");
      window.dispatchEvent(new Event("helena:intro-content-ready"));
    };

    const finish = () => {
      root.classList.remove(
        "brand-intro-playing",
        "brand-intro-ready",
        "brand-intro-revealing",
        "brand-intro-content-revealing",
      );
      root.classList.add("brand-intro-complete");
      window.dispatchEvent(new Event("helena:intro-complete"));
      setHidden(true);
    };

    const startIntro = () => {
      if (started) return;
      started = true;
      window.clearTimeout(assetFallbackTimer);
      root.classList.add("brand-intro-ready");
      revealTimer = window.setTimeout(() => root.classList.add("brand-intro-revealing"), 2250);
      contentTimer = window.setTimeout(revealContent, 3150);
      finishTimer = window.setTimeout(finish, 4100);
    };

    root.classList.remove("is-leaving");
    if (reducedMotion) {
      revealContent();
      finish();
      return;
    }

    root.classList.remove(
      "brand-intro-complete",
      "brand-intro-ready",
      "brand-intro-revealing",
      "brand-intro-content-revealing",
    );
    root.classList.add("brand-intro-playing");
    window.addEventListener("helena:intro-assets-ready", startIntro, { once: true });
    assetFallbackTimer = window.setTimeout(startIntro, 4000);

    return () => {
      window.removeEventListener("helena:intro-assets-ready", startIntro);
      window.clearTimeout(revealTimer);
      window.clearTimeout(contentTimer);
      window.clearTimeout(finishTimer);
      window.clearTimeout(assetFallbackTimer);
      root.classList.remove(
        "brand-intro-playing",
        "brand-intro-ready",
        "brand-intro-revealing",
        "brand-intro-content-revealing",
      );
    };
  }, []);

  useEffect(() => {
    const intro = introRef.current;
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const formationCanvases = Array.from(intro.querySelectorAll<HTMLCanvasElement>(".brand-intro-formation"));
    const formationContexts = formationCanvases.map((canvas) => canvas.getContext("2d"));
    const flightCanvases = Array.from(intro.querySelectorAll<HTMLCanvasElement>(".brand-intro-flight"));
    const flightContexts = flightCanvases.map((canvas) => canvas.getContext("2d"));
    if (formationContexts.some((context) => !context) || flightContexts.some((context) => !context)) return;

    const formationSprite = new window.Image();
    const flightSprite = new window.Image();
    const creationCurves = [.68, 1.34, .86, 1.52, .76, 1.16, .61, 1.42, .94, 1.62, .72];
    let creationStartedAt = 0;
    let animationFrame = 0;
    let cancelled = false;
    let formationLoaded = false;
    let flightLoaded = false;
    let lastFlightFrame = -1;
    const lastFormationFrames = formationCanvases.map(() => -1);

    const startAnimation = () => {
      if (cancelled || animationFrame || !formationLoaded || !flightLoaded) return;
      creationStartedAt = window.performance.now();
      window.dispatchEvent(new Event("helena:intro-assets-ready"));
      animationFrame = window.requestAnimationFrame(animate);
    };

    const animate = (time: number) => {
      if (cancelled) return;

      if (formationLoaded) {
        const creationProgress = Math.min(1, Math.max(0, (time - creationStartedAt) / 2200));
        formationCanvases.forEach((canvas, index) => {
          const context = formationContexts[index];
          if (!context) return;
          const curvedProgress = Math.pow(creationProgress, creationCurves[index]);
          const frame = creationProgress >= 1 ? 43 : Math.min(42, Math.floor(curvedProgress * 43));
          if (frame === lastFormationFrames[index]) return;
          const column = frame % 8;
          const row = Math.floor(frame / 8);
          context.clearRect(0, 0, 256, 256);
          context.drawImage(formationSprite, column * 256, row * 256, 256, 256, 0, 0, 256, 256);
          lastFormationFrames[index] = frame;
        });
      }

      const flightFrame = Math.floor(time / 42) % 16;
      if (flightLoaded && flightFrame !== lastFlightFrame) {
        flightCanvases.forEach((canvas, index) => {
          const context = flightContexts[index];
          if (!context) return;
          const offsetFrame = (flightFrame + index * 2) % 16;
          const column = offsetFrame % 4;
          const row = Math.floor(offsetFrame / 4);
          context.clearRect(0, 0, 256, 256);
          context.drawImage(flightSprite, column * 512, row * 512, 512, 512, 0, 0, 256, 256);
        });
        lastFlightFrame = flightFrame;
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    formationSprite.onload = () => {
      if (cancelled) return;
      formationLoaded = true;
      startAnimation();
    };
    flightSprite.onload = () => {
      if (cancelled) return;
      flightLoaded = true;
      startAnimation();
    };
    formationSprite.src = "/media/logo-formation-sprite-v3.webp";
    flightSprite.src = "/media/butterfly-scroll-sprite-v2.webp";

    return () => {
      cancelled = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className="brand-intro" ref={introRef} aria-hidden="true">
      <div className="brand-intro-halo" />
      <div className="brand-intro-butterflies">
        {Array.from({ length: 11 }, (_, index) => (
          <span className={`brand-intro-butterfly brand-intro-butterfly-${index + 1}`} key={index}>
            <canvas className="brand-intro-formation" width="256" height="256" />
            <canvas className="brand-intro-flight" width="256" height="256" />
          </span>
        ))}
      </div>
      <div className="brand-intro-wordmark"><span>Helena</span><small>Joias</small></div>
      <p>Forma · luz · presença</p>
    </div>
  );
}
