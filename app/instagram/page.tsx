/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect } from "react";

function LiquidLink({ href, children, detail, external = false, primary = false }: { href: string; children: React.ReactNode; detail: string; external?: boolean; primary?: boolean }) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (external || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    document.documentElement.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = href; }, 420);
  };

  return (
    <a
      className={`liquid-link ${primary ? "liquid-link-primary" : ""}`}
      href={href}
      onClick={handleClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      <span><strong>{children}</strong><small>{detail}</small></span><i aria-hidden="true">{external ? "↗︎" : "→"}</i>
    </a>
  );
}

function WhatsAppButton({ compact = false }: { compact?: boolean }) {
  return (
    <button className={`liquid-whatsapp ${compact ? "liquid-whatsapp-compact" : ""}`} type="button" disabled aria-label="Falar no WhatsApp — número ainda não cadastrado">
      <span className="whatsapp-icon" aria-hidden="true">◌</span>
      <span><strong>Falar no WhatsApp</strong><small>Canal pronto para receber o número</small></span>
      <i aria-hidden="true">→</i>
    </button>
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
    }, { rootMargin: "0px 0px -10%", threshold: .14 });
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
      <div className="intro-curtain" aria-hidden="true"><span className="intro-mark">HELENA</span></div>
      <div className="exit-curtain" aria-hidden="true" />
      <div className="link-progress" aria-hidden="true" />

      <header className="link-header">
        <Link href="/" className="link-home" aria-label="Voltar para Helena Joias" onClick={(event) => {
          event.preventDefault();
          document.documentElement.classList.add("is-leaving");
          window.setTimeout(() => { window.location.href = "/"; }, 420);
        }}><span aria-hidden="true">←</span> Site completo</Link>
        <p>Helena <i /> beleza <i /> presença</p>
      </header>

      <section className="link-hero" aria-labelledby="link-title">
        <div className="liquid-orb liquid-orb-one" aria-hidden="true" />
        <div className="liquid-orb liquid-orb-two" aria-hidden="true" />
        <div className="link-hero-inner">
          <div className="link-brand-mark">
            <img src="/media/logo-transparent.png" alt="Helena Joias" width="828" height="828" fetchPriority="high" decoding="async" />
          </div>
          <p className="link-handle">@helenaajoias · um novo conceito em joias</p>
          <h1 id="link-title">Entre para conhecer.<br /><em>Fique para encontrar o seu brilho.</em></h1>
          <p className="link-deck">A Helena é uma experiência de descoberta: joias, detalhes e composições para olhar de perto, combinar e escolher do seu jeito.</p>

          <nav className="liquid-links" aria-label="Links principais da Helena Joias">
            <LiquidLink href="/#colecoes" detail="Veja as três experiências visuais" primary>Explorar as coleções</LiquidLink>
            <LiquidLink href="https://www.instagram.com/helenaajoias/" detail="Acompanhe novidades e inspirações" external>Ver Instagram</LiquidLink>
            <WhatsAppButton />
            <button className="liquid-route" type="button" disabled aria-label="Traçar rota — endereço ainda não cadastrado">
              <span><strong>Traçar rota</strong><small>Endereço a confirmar</small></span><i aria-hidden="true">⌖</i>
            </button>
          </nav>
          <a className="link-scroll-cue" href="#encontre">Descubra a Helena <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className="link-discovery" id="encontre" aria-labelledby="discovery-title">
        <div className="link-section-heading" data-link-reveal>
          <p>O que você encontra aqui</p>
          <h2 id="discovery-title">Uma loja para descobrir<br /><em>novas formas de brilhar.</em></h2>
        </div>
        <div className="discovery-grid">
          <article className="discovery-card discovery-card-one" data-link-reveal>
            <span>01</span><i aria-hidden="true" />
            <h3>Detalhes que aproximam</h3>
            <p>Joias para observar de perto e perceber o desenho, o brilho e a presença de cada composição.</p>
          </article>
          <article className="discovery-card discovery-card-two" data-link-reveal>
            <span>02</span><i aria-hidden="true" />
            <h3>Combinações com intenção</h3>
            <p>Camadas, volumes e pontos de luz para criar um jeito de usar que conversa com você.</p>
          </article>
          <article className="discovery-card discovery-card-three" data-link-reveal>
            <span>03</span><i aria-hidden="true" />
            <h3>Escolhas para cada momento</h3>
            <p>Peças que acompanham o cotidiano, marcam encontros e dão uma nova leitura ao look.</p>
          </article>
        </div>
      </section>

      <section className="link-ritual" aria-labelledby="ritual-title">
        <div className="ritual-orbit" aria-hidden="true"><i /><i /><i /></div>
        <div className="ritual-copy" data-link-reveal>
          <p>O ritual Helena</p>
          <h2 id="ritual-title">Ver.<br />Combinar.<br /><em>Escolher.</em></h2>
        </div>
        <p className="ritual-note" data-link-reveal>Não é só sobre encontrar uma joia. É sobre reconhecer o detalhe que muda a composição — e faz você querer olhar outra vez.</p>
      </section>

      <section className="link-visit" aria-labelledby="visit-title">
        <div className="link-liquid-jewel" aria-hidden="true" />
        <div className="visit-copy" data-link-reveal>
          <p>Venha viver de perto</p>
          <h2 id="visit-title">A Helena espera<br /><em>pelo seu encontro.</em></h2>
          <p>Segunda a sexta, das 08h às 18h.<br />Sábado, das 08h às 12h.</p>
        </div>
        <div className="visit-actions" data-link-reveal>
          <WhatsAppButton compact />
          <LiquidLink href="https://www.instagram.com/helenaajoias/" detail="@helenaajoias" external primary>Acompanhar no Instagram</LiquidLink>
          <button className="liquid-route" type="button" disabled aria-label="Traçar rota — endereço ainda não cadastrado">
            <span><strong>Traçar rota</strong><small>Será ativada com o endereço</small></span><i aria-hidden="true">⌖</i>
          </button>
        </div>
      </section>

      <footer className="link-footer">
        <span>Helena Joias</span><span>Beleza · brilho · exclusividade</span>
        <Link href="/">Ver experiência completa <span aria-hidden="true">↗︎</span></Link>
      </footer>
    </main>
  );
}
