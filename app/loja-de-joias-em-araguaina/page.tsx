import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteName, siteUrl, store, storeLocationUrl } from "@/app/seo";
import {
  buildWhatsAppUrl,
  HELENA_WHATSAPP_NUMBER,
  HELENA_WHATSAPP_SITE_MESSAGE,
} from "@/lib/whatsapp/order-message";

const pagePath = "/loja-de-joias-em-araguaina";
const pageUrl = `${siteUrl}${pagePath}`;
const pageTitle = "Loja de joias em Araguaína, TO";
const pageDescription =
  "Conheça a Helena Joias no Setor Central de Araguaína, TO. Visite a loja para ver colares, brincos, anéis, pulseiras e acessórios ou fale pelo WhatsApp.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: pagePath },
  openGraph: {
    type: "website",
    url: pagePath,
    siteName,
    title: `${pageTitle} | ${siteName}`,
    description: pageDescription,
    images: [
      {
        url: "/media/gallery-3-3.jpg",
        width: 1170,
        height: 1560,
        alt: "Look com joias em frente à Helena Joias em Araguaína",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | ${siteName}`,
    description: pageDescription,
    images: ["/media/gallery-3-3.jpg"],
  },
};

export default function LocalStorePage() {
  const whatsappUrl = buildWhatsAppUrl(HELENA_WHATSAPP_NUMBER, HELENA_WHATSAPP_SITE_MESSAGE);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${pageTitle} | ${siteName}`,
        description: pageDescription,
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: siteName, item: siteUrl },
          { "@type": "ListItem", position: 2, name: pageTitle, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className="local-store-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <nav className="local-store-nav" aria-label="Navegação estrutural">
        <Link href="/">Helena Joias</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Loja em Araguaína</span>
      </nav>

      <section className="local-store-hero" aria-labelledby="local-store-title">
        <div>
          <p>Helena Joias em Araguaína, Tocantins</p>
          <h1 id="local-store-title">Loja de joias em Araguaína, TO.</h1>
          <p className="local-store-intro">
            A Helena Joias fica no Setor Central de Araguaína para quem quer conhecer colares, brincos,
            anéis, pulseiras e acessórios de perto antes de escolher.
          </p>
          <div className="local-store-actions">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
            <a href={storeLocationUrl} target="_blank" rel="noreferrer">Traçar rota</a>
          </div>
        </div>
        <Image
          src="/media/gallery-3-3.jpg"
          alt="Look com joias em frente à Helena Joias em Araguaína"
          width={1170}
          height={1560}
          sizes="(max-width: 760px) 100vw, 42vw"
          priority
        />
      </section>

      <section className="local-store-details" aria-label="Informações da loja">
        <article>
          <h2>Onde fica a Helena Joias?</h2>
          <p>
            Rua Sadoc Correia, 1293, Casa 3, Setor Central, Araguaína-TO. CEP {store.postalCode}.
          </p>
        </article>
        <article>
          <h2>Quando a loja atende?</h2>
          <p>De segunda a sexta, das 08h às 18h, e aos sábados, das 08h às 12h.</p>
        </article>
        <article>
          <h2>Como começar o atendimento?</h2>
          <p>
            Você pode visitar a loja ou iniciar a conversa pelo WhatsApp para tirar dúvidas antes de ir.
          </p>
        </article>
      </section>

      <section className="local-store-return" aria-label="Voltar à experiência Helena Joias">
        <p>Conheça a experiência completa da Helena Joias.</p>
        <Link href="/">Ir para a página principal</Link>
      </section>
    </main>
  );
}
