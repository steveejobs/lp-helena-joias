import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Como a landing page da Helena Joias respeita a sua privacidade.",
  alternates: { canonical: "/privacidade" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <header>
        <p>Privacidade</p>
        <h1>Dados com cuidado,<br /><em>escolhas com clareza.</em></h1>
        <span>Última atualização: 3 de agosto de 2026.</span>
      </header>
      <div className="privacy-content">
        <section>
          <span>01</span>
          <div>
            <h2>Nenhum rastreamento</h2>
            <p>
              Este site não usa cookies, ferramentas de analytics, login ou banco de dados.
              A sua navegação pela landing page não cria um perfil de visitante.
            </p>
          </div>
        </section>
        <section>
          <span>02</span>
          <div>
            <h2>Links externos</h2>
            <p>
              Ao abrir WhatsApp, Instagram ou Google Maps, você passa a usar os serviços dessas
              empresas. A partir desse momento, valem as políticas de privacidade de cada serviço.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
