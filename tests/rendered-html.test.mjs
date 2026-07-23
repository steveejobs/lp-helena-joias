import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders development preview metadata", async () => {
  const response = await render();

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("renders the complete Helena Joias home contract", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /O brilho encontra a sua forma/);
  assert.match(html, /Detalhes em movimento/);
  assert.match(html, /Luz de perto/);
  assert.match(html, /Volume dourado/);
  assert.match(html, /Cor &amp; presença/);
  assert.match(html, /08h — 18h/);
  assert.match(html, /Falar no WhatsApp/);
  assert.match(html, /Traçar rota/);
  assert.match(html, /Prove\. Combine/);
  assert.match(html, /Venha viver/);
  assert.match(html, /\/media\/logo-formation-v2\.webp/);
  assert.match(html, /class="scroll-butterfly"/);
  assert.doesNotMatch(html, /Imagem anterior|Próxima imagem/);
});

test("renders the branded links route", async () => {
  const response = await render("/instagram");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Seu brilho/);
  assert.match(html, /Duas leituras/);
  assert.match(html, /Duas galerias horizontais/);
  assert.match(html, /Ver Instagram/);
  assert.match(html, /Falar no WhatsApp/);
  assert.match(html, /Traçar rota/);
  assert.match(html, /atelier-1\.mp4/);
  assert.match(html, /atelier-2\.mp4/);
  assert.match(html, /https:\/\/www\.instagram\.com\/helenaajoias\//);
  assert.match(html, /gallery-1-3\.jpg/);
  assert.match(html, /gallery-2-4\.jpg/);
});

test("uses every editorial photograph only once per route and removes the HJ ornament", async () => {
  const [home, links] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/instagram/page.tsx", import.meta.url), "utf8"),
  ]);
  const homePhotographs = home.match(/\/media\/gallery-[1-3]-[1-4]\.jpg/g) ?? [];
  const linkPhotographs = links.match(/\/media\/gallery-[1-3]-[1-4]\.jpg/g) ?? [];

  assert.equal(homePhotographs.length, new Set(homePhotographs).size);
  assert.equal(linkPhotographs.length, new Set(linkPhotographs).size);
  assert.equal(linkPhotographs.length, 8);
  assert.doesNotMatch(`${home}\n${links}`, />HJ</);
});

test("ships the high-resolution logo formation and scroll-driven butterfly assets", async () => {
  const [home, formation, formationFallback, sprite] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/media/logo-formation-v2.webp", import.meta.url)),
    readFile(new URL("../public/media/logo-formation-final-v2.webp", import.meta.url)),
    readFile(new URL("../public/media/butterfly-scroll-sprite-v2.webp", import.meta.url)),
  ]);

  assert.match(home, /helena:intro-complete/);
  assert.match(home, /\/media\/butterfly-scroll-sprite-v2\.webp/);
  assert.match(home, /Math\.floor\(window\.scrollY \/ 34\) % 16/);
  assert.match(home, /column \* 512, row \* 512, 512, 512/);
  assert.ok(formation.byteLength > 1_000_000);
  assert.ok(formationFallback.byteLength > 100_000);
  assert.ok(sprite.byteLength > 1_000_000);
});

test("keeps contact CTAs prominent but inactive until data is confirmed", async () => {
  const [home, links] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/instagram/page.tsx", import.meta.url), "utf8"),
  ]);
  const source = `${home}\n${links}`;

  assert.match(source, /Falar no WhatsApp/);
  assert.match(source, /Traçar rota/);
  assert.doesNotMatch(source, /wa\.me|api\.whatsapp\.com|google\.com\/maps\/dir/);
  assert.doesNotMatch(source, /images\.length \+ \.85/);
  assert.match(home, /Math\.exp\(-delta \/ 185\)/);
  assert.match(home, /const maxStep = delta \/ 1350/);
  assert.match(links, /Math\.exp\(-delta \/ 190\)/);
  assert.match(links, /const maxStep = delta \/ 1300/);
});
