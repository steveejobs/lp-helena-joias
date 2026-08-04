"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { BrandIntro } from "@/components/brand-intro";
import { HomeWhatsAppButton } from "@/components/home/whatsapp-button";
import { useReversibleReveal } from "@/components/motion-controller";
import { brandHighlight, store, storeLocationUrl } from "@/lib/brand/copy";

type GalleryImage = { src: string; alt: string; position?: string };

const galleries: Record<string, GalleryImage[]> = {
  close: [
    { src: "/media/gallery-1-1.jpg", alt: "Modelo usando brincos, colares e pulseiras Helena Joias" },
    { src: "/media/gallery-1-2.jpg", alt: "Modelo exibindo colares delicados e anéis Helena Joias" },
    { src: "/media/gallery-1-3.jpg", alt: "Detalhe de mãos com anéis e pulseiras Helena Joias" },
    { src: "/media/gallery-1-4.jpg", alt: "Retrato com brincos e camadas de colares Helena Joias" },
  ],
  volume: [
    { src: "/media/gallery-2-1.jpg", alt: "Composição com colar e bracelete dourados Helena Joias" },
    { src: "/media/gallery-2-3.jpg", alt: "Colar e bracelete de formas esculturais Helena Joias" },
    { src: "/media/gallery-2-4.jpg", alt: "Composição dourada com colar, brincos e clutch" },
  ],
  color: [
    { src: "/media/gallery-3-1.jpg", alt: "Look azul com brincos, colares e pulseiras Helena Joias", position: "center 16%" },
    { src: "/media/gallery-3-2.jpg", alt: "Close de colar, brinco geométrico e outras joias Helena", position: "center 24%" },
    { src: "/media/gallery-3-3.jpg", alt: "Look azul em frente à Helena Joias", position: "center 20%" },
  ],
};

let butterflyFramesPromise: Promise<HTMLCanvasElement[]> | null = null;

function loadButterflyFrames() {
  if (butterflyFramesPromise) return butterflyFramesPromise;

  butterflyFramesPromise = new Promise((resolve, reject) => {
    const sprite = new window.Image();
    sprite.onload = () => {
      const frames = Array.from({ length: 16 }, (_, index) => {
        const frame = document.createElement("canvas");
        frame.width = 256;
        frame.height = 256;
        const context = frame.getContext("2d");
        if (!context) return frame;
        const column = index % 4;
        const row = Math.floor(index / 4);
        context.drawImage(sprite, column * 512, row * 512, 512, 512, 0, 0, 256, 256);
        return frame;
      });
      resolve(frames);
    };
    sprite.onerror = () => reject(new Error("NÃ£o foi possÃ­vel carregar a animaÃ§Ã£o das borboletas."));
    sprite.src = "/media/butterfly-scroll-sprite-v2.webp";
  });

  return butterflyFramesPromise;
}

function TransitionLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || href.startsWith("#")) return;
    event.preventDefault();
    document.documentElement.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = href; }, 440);
  };

  return <a href={href} className={className} onClick={handleClick}>{children}</a>;
}

function ScrollButterfly() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const desktopMotion = window.matchMedia("(min-width: 721px)");
    if (reduced || connection?.saveData) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frames: HTMLCanvasElement[] = [];
    let cancelled = false;
    let loaded = false;
    let requested = 0;
    let wingFrame = 0;
    let lastFrame = -1;
    let lastScrollY = window.scrollY;
    let scrollDirection = 1;
    let pendingDirection = scrollDirection;
    let pendingDistance = 0;
    let active = false;
    let listening = false;
    let loadStarted = false;
    let maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    let lastToneCheck = 0;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const updateDirection = (delta: number) => {
      if (Math.abs(delta) < 1.25) return;
      const nextDirection = delta > 0 ? 1 : -1;
      if (nextDirection === scrollDirection) {
        pendingDirection = nextDirection;
        pendingDistance = 0;
        return;
      }
      if (nextDirection !== pendingDirection) {
        pendingDirection = nextDirection;
        pendingDistance = Math.abs(delta);
      } else {
        pendingDistance += Math.abs(delta);
      }
      if (pendingDistance >= 24) {
        scrollDirection = nextDirection;
        pendingDistance = 0;
      }
    };
    const render = (time = performance.now()) => {
      requested = 0;
      if (!active) return;
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;
      updateDirection(scrollDelta);
      lastScrollY = scrollY;
      const progress = clamp(scrollY / maxScroll);

      const driftX = Math.sin(progress * Math.PI * 7) * 13;
      const driftY = Math.cos(progress * Math.PI * 9) * 18;
      const velocityX = Math.cos(progress * Math.PI * 7) * Math.PI * 7 * 13 * scrollDirection;
      const velocityY = -Math.sin(progress * Math.PI * 9) * Math.PI * 9 * 18 * scrollDirection;
      const rotation = Math.atan2(velocityY, velocityX) * 180 / Math.PI + 90;
      const depth = .08 + Math.pow(Math.max(0, Math.sin(progress * Math.PI)), .42) * .92;
      wrapper.style.setProperty("--butterfly-opacity", loaded ? ".3" : "0");
      wrapper.style.setProperty("--butterfly-x", `${driftX.toFixed(2)}px`);
      wrapper.style.setProperty("--butterfly-y", `${driftY.toFixed(2)}px`);
      wrapper.style.setProperty("--butterfly-rotation", `${rotation.toFixed(2)}deg`);
      wrapper.style.setProperty("--butterfly-scale", depth.toFixed(3));

      if (time - lastToneCheck > 140) {
        lastToneCheck = time;
        const beneath = document.elementFromPoint(window.innerWidth - 70, window.innerHeight * .62) as HTMLElement | null;
        wrapper.classList.toggle("is-on-dark", Boolean(beneath?.closest(".movement, .collection-night, .site-footer")));
      }
    };

    const animateWings = (time: number) => {
      if (!active) {
        wingFrame = 0;
        return;
      }
      const frame = Math.floor(time / 78) % 16;
      if (loaded && frame !== lastFrame) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(frames[frame], 0, 0, canvas.width, canvas.height);
        lastFrame = frame;
      }
      wingFrame = window.requestAnimationFrame(animateWings);
    };

    const requestRender = () => {
      if (!requested) requested = window.requestAnimationFrame(render);
    };

    const handleResize = () => {
      maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      requestRender();
    };

    const startListening = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("scroll", requestRender, { passive: true });
      window.addEventListener("resize", handleResize);
    };

    const stopListening = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", handleResize);
    };

    const syncActivity = () => {
      active = desktopMotion.matches && document.visibilityState === "visible";
      wrapper.classList.toggle("is-motion-active", active);
      if (!active) {
        stopListening();
        wrapper.style.setProperty("--butterfly-opacity", "0");
        if (requested) window.cancelAnimationFrame(requested);
        if (wingFrame) window.cancelAnimationFrame(wingFrame);
        requested = 0;
        wingFrame = 0;
        return;
      }

      startListening();
      lastScrollY = window.scrollY;
      render();
      if (!loadStarted) {
        loadStarted = true;
        void loadButterflyFrames().then((loadedFrames) => {
          if (cancelled) return;
          frames = loadedFrames;
          loaded = true;
          syncActivity();
        }).catch(() => undefined);
      } else if (loaded && !wingFrame) {
        wingFrame = window.requestAnimationFrame(animateWings);
      }
    };

    desktopMotion.addEventListener("change", syncActivity);
    document.addEventListener("visibilitychange", syncActivity);
    syncActivity();

    return () => {
      cancelled = true;
      stopListening();
      desktopMotion.removeEventListener("change", syncActivity);
      document.removeEventListener("visibilitychange", syncActivity);
      if (requested) window.cancelAnimationFrame(requested);
      if (wingFrame) window.cancelAnimationFrame(wingFrame);
    };
  }, []);

  return (
    <div className="scroll-butterfly" ref={wrapperRef} aria-hidden="true">
      <canvas ref={canvasRef} width="256" height="256" />
    </div>
  );
}

function SectionButterflyPass({ count, tone = "light" }: { count: 1 | 3; tone?: "light" | "dark" }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduced || connection?.saveData) return;

    const section = wrapper.parentElement;
    const items = Array.from(wrapper.querySelectorAll<HTMLElement>(".section-butterfly-pass-item"));
    const canvases = Array.from(wrapper.querySelectorAll<HTMLCanvasElement>("canvas"));
    const contexts = canvases.map((canvas) => canvas.getContext("2d"));
    if (!section || contexts.some((context) => !context)) return;

    let frames: HTMLCanvasElement[] = [];
    let cancelled = false;
    let spriteLoaded = false;
    let visible = false;
    let wingFrame = 0;
    let scrollFrame = 0;
    let measureFrame = 0;
    let lastSpriteFrame = -1;
    let lastScrollY = window.scrollY;
    let scrollDirection = 1;
    let pendingDirection = scrollDirection;
    let pendingDistance = 0;
    let sectionTop = 0;
    let sectionWidth = 0;
    let sectionHeight = 0;
    let itemSizes: Array<{ width: number; height: number }> = [];
    let listening = false;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const updateDirection = (delta: number) => {
      if (Math.abs(delta) < 1.25) return;
      const nextDirection = delta > 0 ? 1 : -1;
      if (nextDirection === scrollDirection) {
        pendingDirection = nextDirection;
        pendingDistance = 0;
        return;
      }
      if (nextDirection !== pendingDirection) {
        pendingDirection = nextDirection;
        pendingDistance = Math.abs(delta);
      } else {
        pendingDistance += Math.abs(delta);
      }
      if (pendingDistance >= 24) {
        scrollDirection = nextDirection;
        pendingDistance = 0;
      }
    };
    const updatePosition = () => {
      scrollFrame = 0;
      if (!visible) return;
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;
      updateDirection(scrollDelta);
      lastScrollY = scrollY;
      const sectionViewportTop = sectionTop - scrollY;
      const progress = clamp((window.innerHeight - sectionViewportTop) / (window.innerHeight + sectionHeight));

      const tracks = [
        { speed: 1, offset: 0, startX: .02, travelX: .9, arcY: .12 },
        { speed: 1.22, offset: -.08, startX: .9, travelX: -.86, arcY: -.13 },
        { speed: .82, offset: .08, startX: .04, travelX: .86, arcY: -.1 },
      ];

      items.forEach((item, index) => {
        const track = tracks[index];
        const travel = clamp(progress * track.speed + track.offset);
        const itemSize = itemSizes[index] ?? { width: 0, height: 0 };
        const routeWidth = Math.max(0, sectionWidth - itemSize.width);
        const routeHeight = Math.max(0, sectionHeight - itemSize.height);
        const x = (track.startX + track.travelX * travel) * routeWidth;
        const curvedY = progress * routeHeight
          + Math.sin(progress * Math.PI) * track.arcY * Math.min(routeHeight, window.innerHeight);
        const y = Math.min(routeHeight, Math.max(0, curvedY));
        const velocityX = track.travelX * sectionWidth * scrollDirection;
        const velocityY = (sectionHeight
          + Math.cos(progress * Math.PI) * Math.PI * track.arcY * Math.min(sectionHeight, window.innerHeight)) * scrollDirection;
        const rotation = Math.atan2(velocityY, velocityX) * 180 / Math.PI + 90;
        const depth = .07 + Math.pow(Math.max(0, Math.sin(progress * Math.PI)), 1.7) * .93;
        item.style.zIndex = String(Math.max(1, Math.round(depth * 10)));
        item.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${depth.toFixed(3)})`;
      });
    };

    const requestPosition = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updatePosition);
    };

    const measure = () => {
      measureFrame = 0;
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionWidth = rect.width;
      sectionHeight = rect.height;
      itemSizes = items.map((item) => ({ width: item.offsetWidth, height: item.offsetHeight }));
      lastScrollY = window.scrollY;
      requestPosition();
    };

    const requestMeasure = () => {
      if (visible && !measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };

    const startListening = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("scroll", requestPosition, { passive: true });
    };

    const stopListening = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", requestPosition);
    };

    const animateWings = (time: number) => {
      if (!visible) {
        wingFrame = 0;
        return;
      }

      const frame = Math.floor(time / 78) % 16;
      if (spriteLoaded && frame !== lastSpriteFrame) {
        canvases.forEach((canvas, index) => {
          const context = contexts[index];
          if (!context) return;
          const offsetFrame = (frame + index * 3) % 16;
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(frames[offsetFrame], 0, 0, canvas.width, canvas.height);
        });
        lastSpriteFrame = frame;
      }
      wingFrame = window.requestAnimationFrame(animateWings);
    };

    const syncActivity = () => {
      const active = visible && document.visibilityState === "visible";
      wrapper.classList.toggle("is-motion-active", active);
      if (active) {
        startListening();
        requestMeasure();
        if (spriteLoaded && !wingFrame) wingFrame = window.requestAnimationFrame(animateWings);
      } else {
        stopListening();
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
        if (wingFrame) window.cancelAnimationFrame(wingFrame);
        scrollFrame = 0;
        wingFrame = 0;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncActivity();
    }, { rootMargin: "25% 0px" });

    const resizeObserver = new ResizeObserver(requestMeasure);

    void loadButterflyFrames().then((loadedFrames) => {
      if (cancelled) return;
      frames = loadedFrames;
      spriteLoaded = true;
      syncActivity();
    }).catch(() => undefined);
    observer.observe(wrapper);
    resizeObserver.observe(section);
    document.addEventListener("visibilitychange", syncActivity);
    window.addEventListener("resize", requestMeasure);

    return () => {
      cancelled = true;
      observer.disconnect();
      resizeObserver.disconnect();
      stopListening();
      document.removeEventListener("visibilitychange", syncActivity);
      window.removeEventListener("resize", requestMeasure);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
      if (wingFrame) window.cancelAnimationFrame(wingFrame);
    };
  }, []);

  return (
    <div className={`section-butterfly-pass-layer is-${tone}`} ref={wrapperRef} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span className={`section-butterfly-pass-item section-butterfly-pass-item-${index + 1}`} key={index}>
          <span className="section-butterfly-idle">
            <canvas width="192" height="192" />
          </span>
        </span>
      ))}
    </div>
  );
}

function ChoicePortrait() {
  return (
    <figure className="choice-portrait" aria-label="Seleção visual Helena Joias" data-hero-reveal="media">
      <span className="choice-orbit choice-orbit-one" aria-hidden="true" />
      <span className="choice-orbit choice-orbit-two" aria-hidden="true" />
      <span className="choice-card-exit choice-card-one">
        <span className="choice-card-entry">
          <span className="choice-card">
            <Image
              src="/media/gallery-2-2.jpg"
              alt="Composição Helena Joias com colares, brincos e anéis dourados"
              width="1170"
              height="1560"
              sizes="(max-width: 720px) 85vw, 31vw"
              preload
            />
          </span>
        </span>
      </span>
      <span className="choice-card-exit choice-card-two">
        <span className="choice-card-entry">
          <span className="choice-card">
            <Image
              src="/media/gallery-1-4.jpg"
              alt="Modelo usando brincos e colares da Helena Joias"
              width="1170"
              height="1560"
              sizes="(max-width: 720px) 85vw, 31vw"
              loading="lazy"
              decoding="async"
            />
          </span>
        </span>
      </span>
      <span className="choice-card-exit choice-card-three">
        <span className="choice-card-entry">
          <span className="choice-card">
            <Image
              src="/media/gallery-3-2.jpg"
              alt="Modelo usando brincos geométricos e colares da Helena Joias"
              width="1170"
              height="1560"
              sizes="(max-width: 720px) 85vw, 31vw"
              loading="lazy"
              decoding="async"
            />
          </span>
        </span>
      </span>
    </figure>
  );
}

function SmartVideo({ src, poster, label, className = "" }: { src: string; poster: string; label: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const canPlay = !reduced && !connection?.saveData;
    let inView = false;
    let scrolling = false;
    let resumeTimer = 0;

    const sync = () => {
      if (canPlay && inView && !scrolling && document.visibilityState === "visible") {
        if (video.paused) void video.play().catch(() => undefined);
      } else if (!video.paused) {
        video.pause();
      }
    };

    const handleScroll = () => {
      scrolling = true;
      sync();
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        scrolling = false;
        sync();
      }, 160);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio > 0.08;
      sync();
    }, { rootMargin: "10% 0px", threshold: [0, 0.08, 0.35, 0.75] });

    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(resumeTimer);
      video.pause();
    };
  }, []);

  return (
    <figure className={`video-card ${className}`}>
      <video ref={videoRef} muted playsInline loop preload="metadata" poster={poster} aria-label={label}>
        <source src={src} type="video/mp4" />
      </video>
      <figcaption><span>{label}</span><i aria-hidden="true">Em movimento</i></figcaption>
    </figure>
  );
}

function ScrollGallery({
  id,
  eyebrow,
  title,
  description,
  images,
  tone,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  images: GalleryImage[];
  tone: "rose" | "gold" | "night";
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const slides = Array.from(section.querySelectorAll<HTMLElement>(".gallery-slide"));
    const compact = window.matchMedia("(max-width: 900px)").matches;
    let frame = 0;
    let measureFrame = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let previousTime = performance.now();
    let sectionTop = 0;
    let scrollRange = 1;
    let visible = false;
    let listening = false;

    const readProgress = () => {
      return Math.min(1, Math.max(0, (window.scrollY - sectionTop) / scrollRange));
    };

    const paint = (progress: number) => {
      const stepped = progress * images.length;
      const nextActive = Math.min(images.length - 1, Math.floor(stepped));
      const phase = nextActive === images.length - 1 ? Math.min(1, stepped - nextActive) : stepped - nextActive;
      const blend = phase * phase * phase * (phase * (phase * 6 - 15) + 10);

      if (activeIndexRef.current !== nextActive) {
        slides.forEach((slide, index) => {
          slide.classList.toggle("is-past", index < nextActive);
          slide.classList.toggle("is-active", index === nextActive);
          slide.classList.toggle("is-next", index === nextActive + 1);
          slide.classList.toggle("is-future", index > nextActive + 1);
          slide.setAttribute("aria-hidden", String(index !== nextActive));
        });
        activeIndexRef.current = nextActive;
        if (counterRef.current) counterRef.current.textContent = String(nextActive + 1).padStart(2, "0");
      }

      section.style.setProperty("--story-progress", String(progress));
      section.style.setProperty("--story-blend", String(blend));
      section.style.setProperty("--story-next-opacity", String(blend));
      section.style.setProperty("--story-active-scale", String(1.055 - blend * .025));
      section.style.setProperty("--story-active-lift", `${blend * -.45}%`);
      section.style.setProperty("--story-next-scale", String(1.035 - blend * .015));
    };

    const animate = (time: number) => {
      const delta = Math.min(48, time - previousTime);
      previousTime = time;
      const smoothing = 1 - Math.exp(-delta / (compact ? 72 : 92));
      const desiredStep = (targetProgress - currentProgress) * smoothing;
      const maxStep = delta / (compact ? 520 : 680);
      currentProgress += Math.max(-maxStep, Math.min(maxStep, desiredStep));

      if (Math.abs(targetProgress - currentProgress) < .00025) currentProgress = targetProgress;
      paint(currentProgress);

      if (currentProgress !== targetProgress) frame = window.requestAnimationFrame(animate);
      else frame = 0;
    };

    const requestUpdate = () => {
      if (!visible) return;
      targetProgress = readProgress();
      if (!frame) {
        previousTime = performance.now();
        frame = window.requestAnimationFrame(animate);
      }
    };

    const measure = () => {
      measureFrame = 0;
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      scrollRange = Math.max(rect.height - window.innerHeight, 1);
      targetProgress = readProgress();
      if (!frame) {
        currentProgress = targetProgress;
        paint(currentProgress);
      }
    };

    const requestMeasure = () => {
      if (visible && !measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };

    const startListening = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("scroll", requestUpdate, { passive: true });
    };

    const stopListening = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", requestUpdate);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        measure();
        startListening();
        requestUpdate();
      } else {
        stopListening();
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { rootMargin: "25% 0px" });

    const resizeObserver = new ResizeObserver(requestMeasure);

    observer.observe(section);
    resizeObserver.observe(section);
    window.addEventListener("resize", requestMeasure);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      stopListening();
      window.removeEventListener("resize", requestMeasure);
      if (frame) window.cancelAnimationFrame(frame);
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
    };
  }, [images.length]);

  return (
    <section
      ref={sectionRef}
      className={`collection-story collection-${tone}`}
      id={id}
      aria-labelledby={`${id}-title`}
      style={{ "--slide-count": images.length, "--story-height": `${100 + images.length * 32}svh`, "--story-mobile-height": `${96 + images.length * 30}svh` } as React.CSSProperties}
    >
      <div className="collection-sticky">
        <div className="gallery-viewport" aria-label={`Galeria ${title}, conduzida pela rolagem.`}>
          {images.map((image, index) => (
            <figure
              className={`gallery-slide ${index === 0 ? "is-active" : index === 1 ? "is-next" : "is-future"}`}
              key={image.src}
              aria-hidden={index !== 0}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width="1170"
                height="1560"
                sizes="(max-width: 900px) 100vw, 50vw"
                loading="lazy"
                decoding="async"
                style={{ objectPosition: image.position ?? "center" }}
              />
            </figure>
          ))}
          <span className="gallery-sheen" aria-hidden="true" />
          <p className="gallery-counter" aria-live="polite"><b ref={counterRef}>01</b><span />{String(images.length).padStart(2, "0")}</p>
          <p className="gallery-scroll-label" aria-hidden="true">Role para transformar <i>↓</i></p>
        </div>

        <div className="collection-copy" data-reveal="section">
          <p className="collection-eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p className="collection-description">{description}</p>
          <div className="story-progress" aria-hidden="true">
            <i /><span>{String(images.length).padStart(2, "0")} momentos</span>
          </div>
          <div className="collection-actions">
            <TransitionLink className="collection-instagram" href="/instagram">Conhecer a Helena <span aria-hidden="true">→</span></TransitionLink>
            <HomeWhatsAppButton className="whatsapp-spotlight whatsapp-spotlight-compact" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceBridge({
  id,
  eyebrow,
  title,
  description,
  variant,
  showRoute = false,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  variant: "petal" | "orbit" | "finale";
  showRoute?: boolean;
}) {
  return (
    <section className={`experience-bridge bridge-${variant}`} id={id} aria-labelledby={`${id}-title`}>
      <div className="bridge-sculpture" aria-hidden="true"><i /><i /><i /></div>
      <div className="bridge-copy" data-reveal="section">
        <p>{eyebrow}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        <div className="bridge-bottom">
          <p>{description}</p>
          <div className="bridge-actions">
            <TransitionLink className="bridge-primary" href="/instagram">Conhecer a Helena <span aria-hidden="true">↗︎</span></TransitionLink>
            <HomeWhatsAppButton />
            {showRoute ? (
              <a className="route-pending" href={storeLocationUrl} target="_blank" rel="noreferrer">
                <span className="route-copy"><strong>Traçar rota</strong><small>Como chegar</small></span>
                <i className="route-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 21s6-5.15 6-11a6 6 0 1 0-12 0c0 5.85 6 11 6 11Z" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                </i>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useReversibleReveal("[data-reveal]:not([data-reveal='hero'])");

  useEffect(() => {
    const progressElement = document.querySelector<HTMLElement>(".scroll-progress");
    const hero = document.querySelector<HTMLElement>(".choice-hero");
    if (!progressElement || !hero) return;
    let frame = 0;
    let viewportHeight = Math.max(window.innerHeight, 1);
    let maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
    const updateProgress = () => {
      frame = 0;
      progressElement.style.setProperty("--scroll-progress", `${window.scrollY / maxScroll}`);
      if (window.scrollY > viewportHeight * 1.2) return;
      const heroProgress = Math.min(1, window.scrollY / viewportHeight);
      const heroExit = Math.min(1, Math.max(0, (window.scrollY - viewportHeight * .12) / (viewportHeight * .56)));
      hero.style.setProperty("--hero-scroll", String(heroProgress));
      hero.style.setProperty("--hero-exit", String(heroExit));
      hero.style.setProperty("--hero-scale", String(1.03 + heroProgress * .12));
      hero.style.setProperty("--hero-lift", `${heroProgress * -2}%`);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    const handleResize = () => {
      viewportHeight = Math.max(window.innerHeight, 1);
      maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
      requestUpdate();
    };
    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const zones = Array.from(document.querySelectorAll<HTMLElement>(".site-shell > section, .site-shell > footer"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    zones.forEach((zone) => zone.classList.add("motion-zone"));

    if (reduced) {
      zones.forEach((zone) => zone.classList.add("is-motion-active"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-motion-active", entry.isIntersecting);
      });
    }, { rootMargin: "20% 0px", threshold: 0 });

    zones.forEach((zone) => observer.observe(zone));
    return () => {
      observer.disconnect();
      zones.forEach((zone) => zone.classList.remove("motion-zone", "is-motion-active"));
    };
  }, []);

  useEffect(() => {
    const heroElements = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-reveal]"));
    const revealHero = () => {
      window.requestAnimationFrame(() => {
        heroElements.forEach((element) => element.classList.add("is-revealed"));
      });
    };

    const root = document.documentElement;
    if (root.classList.contains("brand-intro-complete") || root.classList.contains("brand-intro-content-revealing")) {
      revealHero();
    } else {
      window.addEventListener("helena:intro-content-ready", revealHero, { once: true });
      window.addEventListener("helena:intro-complete", revealHero, { once: true });
    }

    return () => {
      window.removeEventListener("helena:intro-content-ready", revealHero);
      window.removeEventListener("helena:intro-complete", revealHero);
    };
  }, []);

  return (
    <main className="site-shell">
      <BrandIntro />
      <div className="exit-curtain" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />
      <ScrollButterfly />

      <header className="site-header">
        <a className="brand-lockup" href="#inicio" aria-label="Helena Joias — início">
          <span className="brand-symbol" aria-hidden="true"><Image src="/media/logo-transparent.png" alt="" width="828" height="828" sizes="48px" /></span>
          <span>Helena <small>Joias</small></span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#colecoes">Coleções</a>
          <a href="#movimento">Em movimento</a>
          <a href="#visite">Visite a Helena</a>
          <TransitionLink href="/instagram">Instagram</TransitionLink>
        </nav>
      </header>

      <section className="hero choice-hero" id="inicio" aria-labelledby="hero-title">
        <div className="choice-copy" data-hero-reveal="copy">
          <p className="choice-eyebrow"><i /> Experimente. Combine. Encontre a sua.</p>
          <h1 id="hero-title" aria-label={brandHighlight}>
            <span className="choice-title-mask choice-title-lead" aria-hidden="true"><b>Para cada</b></span>
            <span className="choice-title-mask choice-title-middle" aria-hidden="true"><b>momento especial,</b></span>
            <span className="choice-title-mask choice-title-serif" aria-hidden="true"><b>uma joia única.</b></span>
          </h1>
          <div className="choice-actions">
            <HomeWhatsAppButton className="choice-primary-action choice-whatsapp-action" />
            <a
              className="choice-route-action"
              href={storeLocationUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span><strong>Traçar rota</strong><small>Loja física</small></span>
              <i className="choice-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s6-5.15 6-11a6 6 0 1 0-12 0c0 5.85 6 11 6 11Z" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
              </i>
            </a>
          </div>
        </div>
        <ChoicePortrait />
        <p className="choice-detail" aria-hidden="true">Forma <i /> Luz <i /> Presença</p>
        <a className="scroll-cue" href="#manifesto" aria-label="Continuar para a próxima seção"><span>Role para descobrir</span><i aria-hidden="true" /></a>
      </section>

      <section className="manifesto" id="manifesto" aria-label="Manifesto da marca" data-reveal="section">
        <SectionButterflyPass count={1} />
        <p>Uma loja feita para descobrir.</p>
        <h2>Veja de perto. Combine sem pressa.<br /><em>Encontre a joia que já parece sua.</em></h2>
      </section>

      <section className="movement" id="movimento" aria-labelledby="movement-title">
        <SectionButterflyPass count={3} tone="dark" />
        <div className="movement-heading" data-reveal="section">
          <p className="eyebrow eyebrow-light"><span /> Detalhes em movimento</p>
          <h2 id="movement-title">A joia muda<br /><em>quando você se move.</em></h2>
          <p>Um olhar por dentro da Helena: detalhes, composições e peças que mudam quando encontram movimento.</p>
        </div>
        <div className="video-pair" data-reveal="media">
          <SmartVideo src="/media/atelier-1.mp4" poster="/media/atelier-1-poster.jpg" label="Joias no look" className="video-card-left" />
          <SmartVideo src="/media/atelier-2.mp4" poster="/media/atelier-2-poster.jpg" label="Seleção de peças" className="video-card-right" />
        </div>
        <div className="movement-orbit" aria-hidden="true"><span /></div>
      </section>

      <section className="collections-intro" id="colecoes" aria-labelledby="collections-title" data-reveal="section">
        <SectionButterflyPass count={1} />
        <p>Três momentos. Três leituras.</p>
        <h2 id="collections-title">Escolha o brilho<br /><em>que acompanha o seu.</em></h2>
        <a href="#luz-de-perto">Começar a descoberta <span aria-hidden="true">↓</span></a>
      </section>

      <ScrollGallery
        id="luz-de-perto"
        eyebrow="Brilho rente à pele"
        title="Luz de perto."
        description="Camadas delicadas, pontos de luz e detalhes que aparecem no gesto. Uma seleção para ser observada sem pressa."
        images={galleries.close}
        tone="rose"
      />
      <ExperienceBridge
        id="experimente"
        eyebrow="Mais do que ver"
        title={<>Prove. Combine.<br /><em>Descubra.</em></>}
        description="A experiência Helena acontece no encontro: um espaço para observar cada detalhe, criar novas composições e escolher com intenção."
        variant="petal"
      />
      <ScrollGallery
        id="volume-dourado"
        eyebrow="Forma que ocupa espaço"
        title="Volume dourado."
        description="Colares e braceletes ganham escala. O metal desenha o look e transforma a composição antes mesmo do primeiro passo."
        images={galleries.volume}
        tone="gold"
      />
      <ExperienceBridge
        id="visite"
        eyebrow="Loja de joias em Araguaína"
        title={<>Venha viver<br /><em>a Helena.</em></>}
        description="Visite a Helena Joias no Setor Central, em Araguaína, Tocantins. De segunda a sexta, das 08h às 18h; aos sábados, das 08h às 12h. Veja colares, brincos, anéis e pulseiras de perto e escolha sem pressa."
        variant="orbit"
        showRoute
      />
      <ScrollGallery
        id="cor-e-presenca"
        eyebrow="Cor encontra metal"
        title="Cor & presença."
        description="Acessórios geométricos, camadas e contraste. O brilho entra na composição sem apagar quem o veste."
        images={galleries.color}
        tone="night"
      />
      <ExperienceBridge
        id="encontro"
        eyebrow="Seu brilho, de perto"
        title={<>A melhor escolha<br /><em>é a que encontra você.</em></>}
        description="Conheça a Helena Joias, explore as coleções e encontre novas formas de levar beleza, brilho e presença para cada momento."
        variant="finale"
        showRoute
      />

      <footer className="site-footer">
        <div className="footer-brand">
          <Image src="/media/logo-transparent.png" alt="Helena Joias" width="828" height="828" sizes="176px" loading="lazy" />
        </div>
        <p>Beleza, brilho e presença.</p>
        <nav aria-label="Navegação do rodapé">
          <a href="#inicio">Início</a>
          <a href="#colecoes">Coleções</a>
          <TransitionLink href="/instagram">Experiência Instagram</TransitionLink>
          <a href="https://www.instagram.com/helenaajoias/" target="_blank" rel="noreferrer">Instagram ↗︎</a>
          <HomeWhatsAppButton className="whatsapp-spotlight footer-whatsapp" />
        </nav>
        <div className="footer-meta">
          <address>
            <a href={storeLocationUrl} target="_blank" rel="noreferrer">
              {store.streetAddress} · {store.neighborhood} · {store.city}–{store.state} · CEP {store.postalCode}
            </a>
            <a href={`tel:${store.telephone}`}>(63) 99223-3535</a>
          </address>
          <span>Seg–Sex 08h — 18h · Sábado 08h — 12h</span>
          <small>© {new Date().getFullYear()} Helena Joias</small>
        </div>
      </footer>
    </main>
  );
}
