import type { Metadata } from "next";

import { CookieSettingsButton } from "@/components/analytics/cookie-settings-button";

export const metadata: Metadata = {
  title: "Privacidade e cookies",
  description: "Como a Helena Joias usa dados de navegação e respeita suas escolhas de privacidade.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <header>
        <p>Privacidade</p>
        <h1>Dados com cuidado,<br /><em>escolhas com clareza.</em></h1>
        <span>Última atualização: 28 de julho de 2026.</span>
      </header>
      <div className="privacy-content">
        <section>
          <span>01</span>
          <div>
            <h2>O que coletamos</h2>
            <p>
              Quando você autoriza analytics, registramos páginas visitadas, interação com produtos,
              buscas, abertura do WhatsApp, tipo de dispositivo, navegador, origem da visita e tempo
              de uso com a aba visível.
            </p>
          </div>
        </section>
        <section>
          <span>02</span>
          <div>
            <h2>Localização aproximada</h2>
            <p>
              A cidade e a região são estimadas pela infraestrutura de acesso. Não solicitamos GPS,
              endereço, bairro nem armazenamos o seu IP no painel da Helena.
            </p>
          </div>
        </section>
        <section>
          <span>03</span>
          <div>
            <h2>Cookies opcionais</h2>
            <p>
              O Google Analytics usa o cookie <code>_ga</code> para distinguir visitantes e sessões.
              Ele só pode ser armazenado depois da sua autorização. A sacola e a sua escolha de
              privacidade usam armazenamento estritamente funcional do navegador.
            </p>
          </div>
        </section>
        <section>
          <span>04</span>
          <div>
            <h2>Controle nas suas mãos</h2>
            <p>
              Você pode aceitar, recusar ou mudar sua escolha a qualquer momento. Ao selecionar
              somente o necessário, removemos os identificadores analíticos acessíveis pelo site e
              interrompemos o analytics próprio.
            </p>
            <CookieSettingsButton />
          </div>
        </section>
      </div>
    </main>
  );
}
