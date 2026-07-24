/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type ProfileLinkProps = {
  number: string;
  title: string;
  detail: string;
  href?: string;
  external?: boolean;
  primary?: boolean;
  disabled?: boolean;
};

const topGallery = [
  { src: "/media/gallery-1-1.jpg", alt: "Composição Helena Joias com colares e pulseiras" },
  { src: "/media/gallery-1-2.jpg", alt: "Camadas delicadas de joias Helena" },
  { src: "/media/gallery-1-3.jpg", alt: "Anéis e pulseiras Helena em detalhe" },
  { src: "/media/gallery-1-4.jpg", alt: "Retrato com brincos e colares Helena" },
];

const bottomGallery = [
  { src: "/media/gallery-2-1.jpg", alt: "Joias douradas de formas marcantes" },
  { src: "/media/gallery-2-2.jpg", alt: "Composição dourada Helena Joias" },
  { src: "/media/gallery-2-3.jpg", alt: "Colar e bracelete esculturais Helena" },
  { src: "/media/gallery-2-4.jpg", alt: "Seleção dourada Helena Joias" },
];

function ProfileLink({ number, title, detail, href, external = false, primary = false, disabled = false }: ProfileLinkProps) {
  const className = `profile-link ${primary ? "profile-link-primary" : ""}`;

  if (disabled) {
    return (
      <button className={className} type="button" disabled aria-label={`${title} — indisponível até os dados serem cadastrados`}>
        <span className="profile-link-number">{number}</span>
        <span className="profile-link-copy"><strong>{title}</strong><small>{detail}</small></span>
        <i aria-hidden="true">↗</i>
      </button>
    );
  }

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (external || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    document.documentElement.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = href ?? "/"; }, 380);
  };

  return (
    <a className={className} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} onClick={handleClick}>
      <span className="profile-link-number">{number}</span>
      <span className="profile-link-copy"><strong>{title}</strong><small>{detail}</small></span>
      <i aria-hidden="true">↗</i>
    </a>
  );
}

function ButterflyLoop({ className = "" }: { className?: string }) {
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
      context.clearRect(0, 0, 256, 256);
      context.drawImage(sprite, column * 512, row * 512, 512, 512, 0, 0, 256, 256);
      lastFrame = frame;
    };

    const animate = (time: number) => {
      draw(Math.floor(time / 92) % 16);
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

  return <span className={`link-butterfly ${className}`} aria-hidden="true"><canvas ref={canvasRef} width="256" height="256" /></span>;
}

function ConvergingGallery() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.style.setProperty("--rail-top", "-.35rem");
      section.style.setProperty("--rail-bottom", ".35rem");
      section.style.setProperty("--rail-top-tilt", "-.7deg");
      section.style.setProperty("--rail-bottom-tilt", ".7deg");
      section.style.setProperty("--rail-focus", "1");
      return;
    }
    let frame = 0;
    let target = 0;
    let current = 0;
    let previous = performance.now();

    const read = () => {
      const rect = section.getBoundingClientRect();
      const range = Math.max(rect.height + window.innerHeight, 1);
      return Math.min(1, Math.max(0, (window.innerHeight - rect.top) / range));
    };

    const paint = (progress: number) => {
      const eased = progress * progress * (3 - 2 * progress);
      const encounterProgress = Math.min(1, eased / .68);
      const encounter = encounterProgress * encounterProgress * (3 - 2 * encounterProgress);
      const dissolveProgress = Math.min(1, Math.max(0, (eased - .56) / .44));
      const dissolve = dissolveProgress * dissolveProgress * (3 - 2 * dissolveProgress);
      section.style.setProperty("--rail-top", `${(-1.8 + encounter * 1.45).toFixed(2)}rem`);
      section.style.setProperty("--rail-bottom", `${(1.8 - encounter * 1.45).toFixed(2)}rem`);
      section.style.setProperty("--rail-top-tilt", `${(-2.4 + encounter * 1.55).toFixed(2)}deg`);
      section.style.setProperty("--rail-bottom-tilt", `${(2.4 - encounter * 1.55).toFixed(2)}deg`);
      section.style.setProperty("--rail-focus", String(.82 + encounter * .18));
      section.style.setProperty("--rail-glow", String(.18 + encounter * .42 - dissolve * .1));
    };

    const animate = (time: number) => {
      const delta = Math.min(48, time - previous);
      previous = time;
      const desiredStep = (target - current) * (1 - Math.exp(-delta / 190));
      const maxStep = delta / 1300;
      current += Math.max(-maxStep, Math.min(maxStep, desiredStep));
      if (Math.abs(target - current) < .0003) current = target;
      paint(current);
      if (current !== target) frame = window.requestAnimationFrame(animate);
      else frame = 0;
    };

    const update = () => {
      target = read();
      if (!frame) {
        previous = performance.now();
        frame = window.requestAnimationFrame(animate);
      }
    };

    target = read();
    current = target;
    paint(current);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="link-gallery" ref={sectionRef} aria-labelledby="link-gallery-title">
      <div className="link-gallery-heading" data-link-reveal>
        <p>Seleções Helena</p>
        <h2 id="link-gallery-title">Duas leituras.<br /><em>Um mesmo encontro.</em></h2>
      </div>
      <div className="converging-rails" aria-label="Duas galerias horizontais Helena Joias">
        <div className="gallery-rail gallery-rail-top">
          <div className="gallery-rail-track">
            {[0, 1].map((copy) => (
              <div className="gallery-rail-set" key={copy} aria-hidden={copy === 1 ? "true" : undefined}>
                {topGallery.map((image) => <figure key={`${copy}-${image.src}`}><img src={image.src} alt={copy === 0 ? image.alt : ""} width="1170" height="1560" loading="lazy" decoding="async" /></figure>)}
              </div>
            ))}
          </div>
        </div>
        <div className="rail-meeting" aria-hidden="true"><ButterflyLoop className="link-butterfly-meeting" /></div>
        <div className="gallery-rail gallery-rail-bottom">
          <div className="gallery-rail-track">
            {[0, 1].map((copy) => (
              <div className="gallery-rail-set" key={copy} aria-hidden={copy === 1 ? "true" : undefined}>
                {bottomGallery.map((image) => <figure key={`${copy}-${image.src}`}><img src={image.src} alt={copy === 0 ? image.alt : ""} width="1170" height="1560" loading="lazy" decoding="async" /></figure>)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="link-gallery-note" data-link-reveal>Role devagar: as duas seleções se aproximam, se atravessam e abrem espaço para a próxima descoberta.</p>
    </section>
  );
}

function LinkVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > .45 && !reduced) void video.play().catch(() => undefined);
      else video.pause();
    }, { threshold: [0, .45, .8] });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  return (
    <figure className="link-video-card">
      <video ref={videoRef} muted playsInline loop preload="metadata" poster={poster} aria-label={label}>
        <source src={src} type="video/mp4" />
      </video>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export default function InstagramLinks() {
  useEffect(() => {
    document.body.classList.add("link-body");
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-link-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8%", threshold: .12 });
    revealItems.forEach((item) => observer.observe(item));

    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      document.documentElement.style.setProperty("--link-scroll", String(window.scrollY / max));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      document.body.classList.remove("link-body");
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <main className="link-page">
      <div className="link-intro-curtain" aria-hidden="true"><span>HELENA</span></div>
      <div className="exit-curtain" aria-hidden="true" />
      <div className="link-progress" aria-hidden="true" />

      <header className="link-header">
        <Link href="/" className="link-home" aria-label="Abrir o site completo da Helena Joias" onClick={(event) => {
          event.preventDefault();
          document.documentElement.classList.add("is-leaving");
          window.setTimeout(() => { window.location.href = "/"; }, 380);
        }}><span aria-hidden="true">←</span> Site completo</Link>
        <span>@helenaajoias</span>
      </header>

      <section className="profile-hero" aria-labelledby="link-title">
        <ButterflyLoop className="link-butterfly-hero" />
        <div className="profile-brand">
          <img src="/media/logo-transparent.png" alt="Helena Joias" width="828" height="828" fetchPriority="high" decoding="async" />
        </div>
        <p className="profile-kicker">Um novo conceito em joias</p>
        <h1 id="link-title">Seu brilho<br /><em>começa aqui.</em></h1>
        <p className="profile-deck">Conheça a Helena, explore as coleções e escolha o próximo passo.</p>

        <nav className="profile-links" aria-label="Links principais da Helena Joias">
          <ProfileLink number="01" title="Falar no WhatsApp" detail="Atendimento direto" primary disabled />
          <ProfileLink number="02" title="Traçar rota" detail="Encontre a Helena" disabled />
          <ProfileLink number="03" title="Ver Instagram" detail="@helenaajoias" href="https://www.instagram.com/helenaajoias/" external />
          <ProfileLink number="04" title="Site completo" detail="Viva a experiência Helena" href="/" />
        </nav>

        <div className="profile-hours" aria-label="Horário de funcionamento">
          <span>Seg–Sex <b>08h–18h</b></span><i /><span>Sáb <b>08h–12h</b></span>
        </div>
      </section>

      <ConvergingGallery />

      <section className="link-motion" aria-labelledby="link-motion-title">
        <div className="link-motion-copy" data-link-reveal>
          <p>Por dentro da Helena</p>
          <h2 id="link-motion-title">O brilho muda<br /><em>quando você se move.</em></h2>
        </div>
        <div className="link-video-pair" data-link-reveal>
          <LinkVideo src="/media/atelier-1.mp4" poster="/media/atelier-1-poster.jpg" label="Joias no look" />
          <LinkVideo src="/media/atelier-2.mp4" poster="/media/atelier-2-poster.jpg" label="Seleção de peças" />
        </div>
        <div className="link-final-links" data-link-reveal>
          <ProfileLink number="→" title="Falar no WhatsApp" detail="Atendimento direto" primary disabled />
          <ProfileLink number="↗" title="Acompanhar no Instagram" detail="@helenaajoias" href="https://www.instagram.com/helenaajoias/" external />
        </div>
      </section>

      <footer className="link-footer">
        <span>Helena Joias</span><span>Beleza · brilho · exclusividade</span>
        <Link href="/">Experiência completa <span aria-hidden="true">↗︎</span></Link>
      </footer>
    </main>
  );
}
