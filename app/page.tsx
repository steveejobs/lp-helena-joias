/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { CartCountButton } from "@/components/cart/cart-count-button";
import { HomeStorePreview } from "@/components/home/store-preview";
import { HomeWhatsAppButton } from "@/components/home/whatsapp-button";

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
    { src: "/media/gallery-3-2.jpg", alt: "Close de óculos, brinco geométrico e colares Helena Joias", position: "center 24%" },
    { src: "/media/gallery-3-3.jpg", alt: "Look azul em frente à Helena Joias", position: "center 20%" },
  ],
};

function TransitionLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || href.startsWith("#")) return;
    event.preventDefault();
    document.documentElement.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = href; }, 420);
  };

  return <a href={href} className={className} onClick={handleClick}>{children}</a>;
}

function BrandIntro() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      root.classList.remove("brand-intro-playing", "brand-intro-revealing");
      root.classList.add("brand-intro-complete");
      window.dispatchEvent(new Event("helena:intro-complete"));
      setHidden(true);
    };

    if (reduced) {
      finish();
      return;
    }

    root.classList.remove("brand-intro-complete");
    root.classList.add("brand-intro-playing");
    const revealTimer = window.setTimeout(() => root.classList.add("brand-intro-revealing"), 1320);
    const finishTimer = window.setTimeout(finish, 1980);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(finishTimer);
      root.classList.remove("brand-intro-playing", "brand-intro-revealing");
    };
  }, []);

  if (hidden) return null;

  return (
    <div className="brand-intro" aria-hidden="true">
      <div className="brand-intro-halo" />
      <img
        className="brand-intro-animation"
        src="/media/logo-formation-v2.webp"
        alt=""
        width="720"
        height="720"
        fetchPriority="high"
        decoding="sync"
        onError={(event) => {
          if (!event.currentTarget.src.endsWith("/media/logo-formation-final-v2.webp")) {
            event.currentTarget.src = "/media/logo-formation-final-v2.webp";
          }
        }}
      />
      <div className="brand-intro-wordmark"><span>Helena</span><small>Joias</small></div>
      <p>Forma · luz · presença</p>
    </div>
  );
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
    if (reduced || connection?.saveData) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const sprite = new window.Image();
    let loaded = false;
    let requested = 0;
    let lastFrame = -1;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const render = () => {
      requested = 0;
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = clamp(window.scrollY / max);
      const entrance = clamp((window.scrollY - window.innerHeight * .72) / (window.innerHeight * .72));
      const exit = clamp((max - window.scrollY - window.innerHeight * .18) / (window.innerHeight * .7));
      const frame = Math.floor(window.scrollY / 34) % 16;

      if (loaded && frame !== lastFrame) {
        const column = frame % 4;
        const row = Math.floor(frame / 4);
        context.clearRect(0, 0, 320, 320);
        context.drawImage(sprite, column * 512, row * 512, 512, 512, 0, 0, 320, 320);
        lastFrame = frame;
      }

      const driftX = Math.sin(progress * Math.PI * 7) * 13;
      const driftY = Math.cos(progress * Math.PI * 9) * 18;
      const rotation = Math.sin(progress * Math.PI * 5) * 4;
      wrapper.style.setProperty("--butterfly-opacity", String(entrance * exit * .3));
      wrapper.style.setProperty("--butterfly-x", `${driftX.toFixed(2)}px`);
      wrapper.style.setProperty("--butterfly-y", `${driftY.toFixed(2)}px`);
      wrapper.style.setProperty("--butterfly-rotation", `${rotation.toFixed(2)}deg`);

      const beneath = document.elementFromPoint(window.innerWidth - 70, window.innerHeight * .62) as HTMLElement | null;
      wrapper.classList.toggle("is-on-dark", Boolean(beneath?.closest(".movement, .collection-night, .site-footer")));
    };

    const requestRender = () => {
      if (!requested) requested = window.requestAnimationFrame(render);
    };

    sprite.onload = () => {
      loaded = true;
      render();
    };
    sprite.src = "/media/butterfly-scroll-sprite-v2.webp";
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);

    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      if (requested) window.cancelAnimationFrame(requested);
    };
  }, []);

  return (
    <div className="scroll-butterfly" ref={wrapperRef} aria-hidden="true">
      <canvas ref={canvasRef} width="320" height="320" />
    </div>
  );
}

function ChoicePortrait() {
  return (
    <figure className="choice-portrait" aria-label="Seleção visual Helena Joias">
      <span className="choice-orbit choice-orbit-one" aria-hidden="true" />
      <span className="choice-orbit choice-orbit-two" aria-hidden="true" />
      <span className="choice-card choice-card-one">
        <img
          src="/media/gallery-2-2.jpg"
          alt="Composição Helena Joias com colares, brincos e anéis dourados"
          width="1170"
          height="1560"
          fetchPriority="high"
          decoding="sync"
        />
      </span>
      <span className="choice-card choice-card-two">
        <img
          src="/media/gallery-1-4.jpg"
          alt="Modelo usando brincos e colares da Helena Joias"
          width="1170"
          height="1560"
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className="choice-card choice-card-three">
        <img
          src="/media/gallery-3-2.jpg"
          alt="Modelo usando brincos geométricos e colares da Helena Joias"
          width="1170"
          height="1560"
          loading="lazy"
          decoding="async"
        />
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

    const sync = () => {
      if (canPlay && inView && document.visibilityState === "visible") {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio > 0.08;
      sync();
    }, { rootMargin: "10% 0px", threshold: [0, 0.08, 0.35, 0.75] });

    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
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
    let targetProgress = 0;
    let currentProgress = 0;
    let previousTime = performance.now();

    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      const range = Math.max(section.offsetHeight - window.innerHeight, 1);
      return Math.min(1, Math.max(0, -rect.top / range));
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
      section.style.setProperty("--story-active-saturation", String(.96 + blend * .04));
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
      targetProgress = readProgress();
      if (!frame) {
        previousTime = performance.now();
        frame = window.requestAnimationFrame(animate);
      }
    };

    targetProgress = readProgress();
    currentProgress = targetProgress;
    paint(currentProgress);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
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
              <img
                src={image.src}
                alt={image.alt}
                width="1170"
                height="1560"
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
            <HomeWhatsAppButton className="whatsapp-spotlight whatsapp-spotlight-compact" origin={`coleção ${title}`} />
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
            <TransitionLink className="bridge-primary" href="/instagram">Descobrir a loja <span aria-hidden="true">↗︎</span></TransitionLink>
            <HomeWhatsAppButton origin={`seção ${id}`} />
            {showRoute ? (
              <button className="route-pending" type="button" disabled aria-label="Traçar rota — endereço ainda não cadastrado">
                <span>Traçar rota</span><small>Como chegar</small>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty("--scroll-progress", max > 0 ? `${window.scrollY / max}` : "0");
      const heroProgress = Math.min(1, window.scrollY / Math.max(window.innerHeight, 1));
      document.documentElement.style.setProperty("--hero-scroll", String(heroProgress));
      document.documentElement.style.setProperty("--hero-scale", String(1.03 + heroProgress * .12));
      document.documentElement.style.setProperty("--hero-lift", `${heroProgress * -2}%`);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const hero = elements.find((element) => element.dataset.reveal === "hero");
    const sectionElements = elements.filter((element) => element !== hero);
    let observer: IntersectionObserver | null = null;

    const reveal = (element: HTMLElement) => {
      element.classList.add("is-revealed");
      observer?.unobserve(element);
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target as HTMLElement);
      });
    }, { rootMargin: "18% 0px 18% 0px", threshold: 0.01 });

    sectionElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 1.16 && rect.bottom >= -window.innerHeight * .1) reveal(element);
      else observer?.observe(element);
    });

    const revealHero = () => {
      if (hero) window.requestAnimationFrame(() => reveal(hero));
    };

    if (document.documentElement.classList.contains("brand-intro-complete")) revealHero();
    else window.addEventListener("helena:intro-complete", revealHero, { once: true });

    return () => {
      window.removeEventListener("helena:intro-complete", revealHero);
      observer?.disconnect();
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
          <span className="brand-symbol" aria-hidden="true"><img src="/media/logo-transparent.png" alt="" width="828" height="828" decoding="async" /></span>
          <span>Helena <small>Joias</small></span>
        </a>
        <nav aria-label="Navegação principal">
          <TransitionLink href="/loja" className="nav-cta">Loja <span aria-hidden="true">↗︎</span></TransitionLink>
          <a href="#colecoes">Coleções</a>
          <a href="#movimento">Em movimento</a>
          <a href="#visite">Visite a Helena</a>
          <TransitionLink href="/instagram">Instagram</TransitionLink>
          <CartCountButton />
        </nav>
      </header>

      <section className="hero choice-hero" id="inicio" aria-labelledby="hero-title">
        <div className="choice-copy" data-reveal="hero">
          <p className="choice-eyebrow"><i /> Um novo conceito em joias</p>
          <h1 id="hero-title">
            O brilho
            <span>encontra a sua</span>
            <em>forma.</em>
          </h1>
          <div className="choice-actions">
            <TransitionLink className="choice-primary-action" href="/loja">
              <span><strong>Comprar agora</strong><small>Loja online</small></span>
              <i className="choice-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h13M14 7l5 5-5 5" /></svg>
              </i>
            </TransitionLink>
            <a
              className="choice-route-action"
              href="https://www.google.com/maps/search/?api=1&query=Helena+Joias"
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
        <div className="choice-decision" data-reveal="hero">
          <p>Experimente combinações, descubra novos detalhes e escolha o brilho que faz sentido para você.</p>
        </div>
        <p className="choice-detail" aria-hidden="true">Forma <i /> Luz <i /> Presença</p>
        <a className="scroll-cue" href="#manifesto" aria-label="Continuar para a próxima seção"><span>Role para descobrir</span><i aria-hidden="true" /></a>
      </section>

      <section className="manifesto" id="manifesto" aria-label="Manifesto da marca" data-reveal="section">
        <p>Uma loja feita para descobrir.</p>
        <h2>Veja de perto. Combine sem pressa.<br /><em>Encontre a joia que já parece sua.</em></h2>
      </section>

      <section className="movement" id="movimento" aria-labelledby="movement-title">
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
        <p>Três momentos. Três leituras.</p>
        <h2 id="collections-title">Escolha o brilho<br /><em>que acompanha o seu.</em></h2>
        <a href="#luz-de-perto">Começar a descoberta <span aria-hidden="true">↓</span></a>
      </section>

      <HomeStorePreview />

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
        eyebrow="A próxima escolha começa aqui"
        title={<>Venha viver<br /><em>a Helena.</em></>}
        description="De segunda a sexta, das 08h às 18h. Aos sábados, das 08h às 12h. Um convite para ver cada detalhe de perto e escolher sem pressa."
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
          <img src="/media/logo-transparent.png" alt="Helena Joias" width="828" height="828" loading="lazy" decoding="async" />
        </div>
        <p>Beleza, brilho e presença.</p>
        <nav aria-label="Navegação do rodapé">
          <a href="#inicio">Início</a>
          <TransitionLink href="/loja">Loja online</TransitionLink>
          <a href="#colecoes">Coleções</a>
          <TransitionLink href="/instagram">Experiência Instagram</TransitionLink>
          <a href="https://www.instagram.com/helenaajoias/" target="_blank" rel="noreferrer">Instagram ↗︎</a>
          <HomeWhatsAppButton className="whatsapp-spotlight footer-whatsapp" origin="rodapé da home" />
        </nav>
        <div className="footer-meta"><span>Seg–Sex 08h — 18h · Sábado 08h — 12h</span><small>© {new Date().getFullYear()} Helena Joias</small></div>
      </footer>
    </main>
  );
}
