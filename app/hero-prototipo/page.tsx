import Image from "next/image";
import Link from "next/link";

import "./prototype.css";

export default function HeroPrototypePage() {
  return (
    <main className="hp-page">
      <section className="hp-hero" aria-labelledby="hp-title">
        <header className="hp-header">
          <span className="hp-brand">
            <Image src="/media/logo-transparent.png" alt="" width={828} height={828} priority />
            <b>Helena <small>Joias</small></b>
          </span>
          <span className="hp-stage-label">Protótipo isolado · escolha guiada</span>
        </header>

        <div className="hp-copy">
          <p className="hp-eyebrow"><i /> Um novo conceito em joias</p>
          <h1 id="hp-title">
            O brilho
            <span>encontra a sua</span>
            <em>forma.</em>
          </h1>
          <div className="hp-actions">
            <Link className="hp-primary-action" href="/loja">
              <span>
                <strong>Comprar agora</strong>
                <small>Loja online</small>
              </span>
              <i className="hp-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h13M14 7l5 5-5 5" />
                </svg>
              </i>
            </Link>

            <a
              className="hp-route-action"
              href="https://www.google.com/maps/search/?api=1&query=Helena+Joias"
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <strong>Traçar rota</strong>
                <small>Loja física</small>
              </span>
              <i className="hp-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s6-5.15 6-11a6 6 0 1 0-12 0c0 5.85 6 11 6 11Z" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
              </i>
            </a>
          </div>
        </div>

        <figure className="hp-portrait">
          <span className="hp-orbit hp-orbit-one" aria-hidden="true" />
          <span className="hp-orbit hp-orbit-two" aria-hidden="true" />
          <span className="hp-portrait-card hp-portrait-card-one">
            <Image
              src="/media/gallery-2-2.jpg"
              alt="Composição Helena Joias com colares, brincos e anéis dourados"
              width={1170}
              height={1560}
              priority
            />
          </span>
          <span className="hp-portrait-card hp-portrait-card-two">
            <Image
              src="/media/gallery-1-4.jpg"
              alt="Modelo usando brincos e colares da Helena Joias"
              width={1170}
              height={1560}
              priority
            />
          </span>
          <span className="hp-portrait-card hp-portrait-card-three">
            <Image
              src="/media/gallery-3-2.jpg"
              alt="Modelo usando brincos geométricos e colares da Helena Joias"
              width={1170}
              height={1560}
              priority
            />
          </span>
        </figure>

        <div className="hp-decision">
          <p>
            Experimente combinações, descubra novos detalhes e escolha o brilho
            que faz sentido para você.
          </p>
        </div>

        <p className="hp-detail" aria-hidden="true">
          Forma <i /> Luz <i /> Presença
        </p>
      </section>
    </main>
  );
}
