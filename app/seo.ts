export { instagramUrl, store, storeLocationUrl } from "@/lib/brand/copy";

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
  "Loja de joias em Araguaína, TO, com colares, brincos, anéis, pulseiras e acessórios selecionados. Visite a Helena Joias ou fale pelo WhatsApp.";

export const siteTitle =
  "Loja de Joias em Araguaína, TO | Helena Joias";
