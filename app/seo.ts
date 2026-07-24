const fallbackSiteUrl = "https://lp-helena-joias-psi.vercel.app";

function normalizeUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

export const siteUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    fallbackSiteUrl,
);

export const siteName = "Helena Joias";

export const siteDescription =
  "Conheça a Helena Joias e explore colares, brincos, anéis, pulseiras e combinações para diferentes estilos. Atendimento de segunda a sábado.";

