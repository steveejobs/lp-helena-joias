import { requireAdminRole } from "@/lib/auth/admin";
import { getAnalyticsReport, resolveAnalyticsPeriod } from "@/lib/analytics/report";

function delta(current: number, previous: number) {
  if (!previous) return current ? "Novo" : "—";
  const value = ((current - previous) / previous) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(0)}%`;
}

function Ranking({
  empty,
  rows,
  title,
}: {
  empty: string;
  rows: Array<{ count: number; label: string }>;
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

  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <div><p>Dados da Helena</p><h1>Analytics</h1></div>
        <span className="admin-period-label">{period.label}</span>
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
      </form>
      <section className="admin-metrics admin-analytics-metrics">
        <article><span>Visitas</span><strong>{report.visits}</strong><small>{delta(report.visits, report.comparison.visits)} vs. período anterior</small></article>
        <article><span>Sessões</span><strong>{report.sessions}</strong><small>{delta(report.sessions, report.comparison.sessions)} vs. período anterior</small></article>
        <article><span>Produtos vistos</span><strong>{report.productViews}</strong><small>visualizações</small></article>
        <article><span>WhatsApp</span><strong>{report.whatsappClicks}</strong><small>aberturas confirmadas</small></article>
      </section>
      <section className="admin-rate-grid">
        <article><span>Produto visto → sacola</span><strong>{report.rates.viewToCart.toFixed(1)}%</strong></article>
        <article><span>Sacola → WhatsApp</span><strong>{report.rates.cartToWhatsapp.toFixed(1)}%</strong></article>
        <article><span>Carrinhos iniciados</span><strong>{report.cartSessions}</strong></article>
        <article><span>Checkouts WhatsApp</span><strong>{report.whatsappSessions}</strong></article>
      </section>
      {report.events === 0 ? (
        <section className="admin-panel admin-empty">
          <h2>Ainda não há dados neste período.</h2>
          <p>Os números aparecerão conforme visitantes reais navegarem pela loja. Nenhuma métrica simulada é exibida.</p>
        </section>
      ) : (
        <div className="admin-analytics-grid">
          <Ranking title="Produtos mais vistos" rows={report.productViewed} empty="Nenhum produto visto." />
          <Ranking title="Produtos mais clicados" rows={report.productClicked} empty="Nenhum produto clicado." />
          <Ranking title="Mais adicionados à sacola" rows={report.productAdded} empty="Nenhuma adição à sacola." />
          <Ranking title="Categorias mais acessadas" rows={report.categories} empty="Nenhuma categoria acessada." />
          <Ranking title="Buscas realizadas" rows={report.searches} empty="Nenhuma busca registrada." />
          <Ranking title="Origem do tráfego" rows={report.sources} empty="Nenhuma origem registrada." />
          <Ranking title="Campanhas UTM" rows={report.utmCampaigns} empty="Nenhuma campanha UTM registrada." />
        </div>
      )}
    </main>
  );
}
