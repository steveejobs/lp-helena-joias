import { AnalyticsCityMap } from "@/components/admin/analytics-city-map";
import { requireAdminRole } from "@/lib/auth/admin";
import {
  getAnalyticsReport,
  resolveAnalyticsPeriod,
  type CountRow,
} from "@/lib/analytics/report";

function delta(current: number, previous: number) {
  if (!previous) return current ? "Novo" : "—";
  const value = ((current - previous) / previous) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(0)}%`;
}

function percentage(value: number, total: number) {
  return total ? (value / total) * 100 : 0;
}

function duration(milliseconds: number) {
  if (!milliseconds) return "0s";
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}min ${seconds % 60}s`;
}

function Ranking({
  empty,
  rows,
  title,
}: {
  empty: string;
  rows: CountRow[];
  title: string;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <section className="admin-panel admin-ranking">
      <h2>{title}</h2>
      {rows.length ? rows.map((row, index) => (
        <div key={`${row.label}-${index}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{row.label}<i style={{ width: `${(row.count / max) * 100}%` }} /></p>
          <strong>{row.count}</strong>
        </div>
      )) : <p className="admin-help">{empty}</p>}
    </section>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminRole(["admin"], "/admin/analytics");
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const period = resolveAnalyticsPeriod({
    end: first(params.fim),
    period: first(params.periodo),
    start: first(params.inicio),
  });
  const report = await getAnalyticsReport(period);
  const { funnel, overview } = report;
  const quickExitRate = percentage(overview.quickExits, overview.sessions);
  const returningRate = percentage(overview.returningSessions, overview.sessions);
  const maxDaily = Math.max(...report.daily.map((row) => row.views), 1);

  return (
    <main className="admin-page admin-analytics-page">
      <header className="admin-page-heading">
        <div><p>Decisões com dados reais</p><h1>Analytics</h1></div>
        <div className="admin-live-status">
          <i aria-hidden="true" />
          <span>{overview.realtime} ativos nos últimos 5 min</span>
        </div>
      </header>

      <form className="admin-period-filters">
        <button name="periodo" value="today">Hoje</button>
        <button name="periodo" value="7">7 dias</button>
        <button name="periodo" value="30">30 dias</button>
        <details>
          <summary>Período personalizado</summary>
          <div>
            <label>Início<input type="date" name="inicio" required /></label>
            <label>Fim<input type="date" name="fim" required /></label>
            <button name="periodo" value="custom">Aplicar</button>
          </div>
        </details>
        <span className="admin-period-label">{period.label}</span>
      </form>

      <section className="admin-metrics admin-analytics-metrics">
        <article><span>Visualizações de página</span><strong>{overview.visits}</strong><small>{delta(overview.visits, report.comparison.visits)} vs. período anterior</small></article>
        <article><span>Sessões reais</span><strong>{overview.sessions}</strong><small>{delta(overview.sessions, report.comparison.sessions)} vs. período anterior</small></article>
        <article><span>Tempo engajado médio</span><strong>{duration(overview.averageEngagedMs)}</strong><small>somente com a aba visível</small></article>
        <article><span>WhatsApp aberto</span><strong>{overview.whatsappClicks}</strong><small>aberturas registradas</small></article>
      </section>

      <section className="admin-panel admin-trend-panel">
        <header>
          <div><p className="admin-section-kicker">Ritmo da audiência</p><h2>Visitas ao longo do período</h2></div>
          <span>{overview.productViews} visualizações de produtos</span>
        </header>
        {report.daily.length ? (
          <div className="admin-trend" aria-label="Visualizações por dia">
            {report.daily.map((row) => (
              <div key={row.day} title={`${row.views} visualizações`}>
                <i style={{ height: `${Math.max((row.views / maxDaily) * 100, 5)}%` }} />
                <span>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(row.day))}</span>
              </div>
            ))}
          </div>
        ) : <p className="admin-help">A linha do tempo aparecerá após as primeiras visitas reais.</p>}
      </section>

      <section className="admin-insight-grid">
        <article className="admin-panel admin-funnel">
          <p className="admin-section-kicker">Jornada de interesse</p>
          <h2>Funil da loja</h2>
          {[
            ["Viram um produto", funnel.viewed],
            ["Iniciaram uma sacola", funnel.cart],
            ["Conferiram no WhatsApp", funnel.whatsapp],
            ["Abriram o WhatsApp", funnel.opened],
          ].map(([label, value], index) => (
            <div key={String(label)}>
              <span>{label}</span>
              <i style={{ width: `${index ? percentage(Number(value), Math.max(funnel.viewed, 1)) : 100}%` }} />
              <strong>{value}</strong>
            </div>
          ))}
          <small>{funnel.abandoned} sessões adicionaram peças, mas não chegaram ao WhatsApp.</small>
        </article>
        <article className="admin-panel admin-audience-card">
          <p className="admin-section-kicker">Qualidade da visita</p>
          <h2>Comportamento</h2>
          <div><span>Tempo total médio</span><strong>{duration(overview.averageDurationMs)}</strong></div>
          <div><span>Visitantes recorrentes</span><strong>{returningRate.toFixed(1)}%</strong></div>
          <div><span>Saídas rápidas</span><strong>{quickExitRate.toFixed(1)}%</strong></div>
          <div><span>Buscas sem resultado</span><strong>{overview.zeroResultSearches}</strong></div>
          <p>“Saída rápida” significa uma página e menos de 10 segundos engajados; não é uma suposição de rejeição.</p>
        </article>
      </section>

      <section className="admin-panel admin-map-panel">
        <header>
          <div><p className="admin-section-kicker">Alcance geográfico</p><h2>Onde a Helena está chegando</h2></div>
          <p>Localização aproximada e agregada por cidade. O painel não armazena IP, GPS, endereço ou bairro.</p>
        </header>
        <div className="admin-map-layout">
          <AnalyticsCityMap cities={report.cities} />
          <ol>
            {report.cities.slice(0, 10).map((city) => (
              <li key={`${city.city}-${city.region}`}>
                <span>{city.city}<small>{[city.region, city.country_code].filter(Boolean).join(" · ")}</small></span>
                <strong>{city.sessions}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {overview.events === 0 ? (
        <section className="admin-panel admin-empty">
          <h2>Ainda não há dados neste período.</h2>
          <p>Os números aparecerão conforme visitantes reais navegarem pela loja. Nenhuma métrica simulada é exibida.</p>
        </section>
      ) : (
        <>
          <section className="admin-panel admin-product-performance">
            <header><div><p className="admin-section-kicker">Peça por peça</p><h2>Desempenho dos produtos</h2></div></header>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Produto</th><th>Impressões</th><th>Cliques</th><th>Visualizações</th><th>Sacola</th><th>WhatsApp</th><th>CTR</th></tr></thead>
                <tbody>
                  {report.products.map((product) => (
                    <tr key={product.id}>
                      <td><strong>{product.label}</strong></td>
                      <td>{product.impressions}</td>
                      <td>{product.clicks}</td>
                      <td>{product.views}</td>
                      <td>{product.additions}</td>
                      <td>{product.whatsapp_intents}</td>
                      <td>{percentage(product.clicks, product.impressions).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div className="admin-analytics-grid">
            <Ranking title="Categorias mais acessadas" rows={report.categories} empty="Nenhuma categoria acessada." />
            <Ranking title="Buscas realizadas" rows={report.searches} empty="Nenhuma busca registrada." />
            <Ranking title="Origem do tráfego" rows={report.sources} empty="Nenhuma origem registrada." />
            <Ranking title="Campanhas UTM" rows={report.campaigns} empty="Nenhuma campanha registrada." />
            <Ranking title="Páginas mais vistas" rows={report.pages} empty="Nenhuma página registrada." />
            <Ranking title="Páginas de entrada" rows={report.entries} empty="Nenhuma entrada registrada." />
            <Ranking title="Páginas de saída" rows={report.exits} empty="Nenhuma saída registrada." />
            <Ranking title="Dispositivos" rows={report.devices} empty="Nenhum dispositivo registrado." />
            <Ranking title="Navegadores" rows={report.browsers} empty="Nenhum navegador registrado." />
            <Ranking title="Sistemas operacionais" rows={report.operatingSystems} empty="Nenhum sistema registrado." />
          </div>
        </>
      )}
      <footer className="admin-analytics-note">
        Dados first-party da Helena, isolados por loja. O GA4 opcional recebe a mesma camada de eventos, mas não altera os números deste painel.
      </footer>
    </main>
  );
}
