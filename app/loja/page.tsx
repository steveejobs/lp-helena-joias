import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CatalogEmpty } from "@/components/store/catalog-empty";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { CategoryRail } from "@/components/store/category-rail";
import { ProductCard } from "@/components/store/product-card";
import { StoreButterfly } from "@/components/store/store-butterfly";
import { listCategories, listProducts, getStore } from "@/lib/catalog/repository";
import { resolveStoreContext } from "@/lib/store/context";
import type { CatalogFilters as Filters } from "@/types/commerce";
import { FilterEvent } from "@/components/analytics/filter-event";

type SearchValues = Record<string, string | string[] | undefined>;

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveNumber(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export const metadata: Metadata = {
  title: "Loja",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>;
}) {
  const params = await searchParams;
  const context = await resolveStoreContext();
  const current = {
    busca: valueOf(params.busca),
    categoria: valueOf(params.categoria),
    curadoria: valueOf(params.curadoria),
    disponibilidade: valueOf(params.disponibilidade),
    preco_max: valueOf(params.preco_max),
    preco_min: valueOf(params.preco_min),
  };
  const filters: Filters = {
    availability:
      current.disponibilidade === "available" || current.disponibilidade === "sold_out"
        ? current.disponibilidade
        : undefined,
    category: current.categoria,
    featured: current.curadoria === "destaque" ? true : undefined,
    maxPrice: positiveNumber(current.preco_max),
    minPrice: positiveNumber(current.preco_min),
    newArrival: current.curadoria === "novidade" ? true : undefined,
    query: current.busca,
  };
  const [store, categories, products] = await Promise.all([
    getStore(context),
    listCategories(context),
    listProducts(context, filters),
  ]);
  const filtered = Object.values(current).some(Boolean);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `/produto/${product.slug}`,
      name: product.name,
    })),
    numberOfItems: products.length,
  };

  return (
    <main className="shop-page">
      <FilterEvent filters={current} resultCount={products.length} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemList).replace(/</g, "\\u003c"),
        }}
      />
      <section className="shop-opening" aria-labelledby="shop-title">
        <div className="shop-opening-copy">
          <p>Curadoria Helena · Loja online</p>
          <h1 id="shop-title">Escolha o brilho<br /><em>que encontra você.</em></h1>
          <div className="shop-opening-actions">
            <Link href="#colecao-completa">
              <span><strong>Explorar a seleção</strong><small>{products.length} peças disponíveis</small></span>
              <i aria-hidden="true">↓</i>
            </Link>
            <Link href="#categorias">Escolher por categoria <span aria-hidden="true">↗︎</span></Link>
          </div>
        </div>
        <div className="shop-opening-art" aria-label="Editorial Helena Joias">
          <span className="shop-opening-orbit shop-opening-orbit-one" aria-hidden="true" />
          <span className="shop-opening-orbit shop-opening-orbit-two" aria-hidden="true" />
          <figure className="shop-opening-image shop-opening-image-main">
            <Image
              src="/media/gallery-3-2.jpg"
              alt="Modelo usando brincos geométricos e colares Helena Joias"
              fill
              priority
              quality={90}
              sizes="(max-width: 720px) 92vw, 38vw"
            />
          </figure>
          <figure className="shop-opening-image shop-opening-image-detail">
            <Image
              src="/media/gallery-2-2.jpg"
              alt="Composição de peças douradas Helena Joias"
              fill
              quality={90}
              sizes="(max-width: 720px) 34vw, 12vw"
            />
          </figure>
          <span className="shop-opening-seal" aria-hidden="true"><b>H</b><small>Curadoria</small></span>
        </div>
        <div className="shop-opening-bottom">
          <p>Uma seleção para olhar de perto, combinar sem pressa e levar para a sua história.</p>
          <span><b>{String(categories.length).padStart(2, "0")}</b> categorias <i /> edição 2026</span>
        </div>
      </section>

      <section className="shop-categories" aria-labelledby="categories-title" data-store-motion="section">
        <div className="store-section-heading">
          <p>Escolha por forma</p>
          <h2 id="categories-title">Encontre o detalhe<br /><em>que fala por você.</em></h2>
        </div>
        <StoreButterfly />
        <CategoryRail categories={categories} />
      </section>

      {products.some((product) => product.featured) ? (
        <section className="featured-products" aria-labelledby="featured-title" data-store-motion="section">
          <div className="store-section-heading">
            <p>Seleção da Helena</p>
            <h2 id="featured-title">Peças em<br /><em>evidência.</em></h2>
          </div>
          <div className="editorial-product-grid">
            {products.filter((product) => product.featured).slice(0, 5).map((product, index) => (
              <ProductCard product={product} store={store} index={index} key={product.id} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="catalog-section" id="colecao-completa" aria-labelledby="catalog-title" data-store-motion="section">
        <div className="catalog-topline">
          <div className="store-section-heading">
            <p>Coleção completa</p>
            <h2 id="catalog-title">{filtered ? "Sua seleção" : "Todos os brilhos"}</h2>
          </div>
          <span>{products.length} {products.length === 1 ? "peça" : "peças"}</span>
        </div>
        <CatalogFilters categories={categories} current={current} pricesEnabled={store.showPrices} />
        {products.length ? (
          <div className="editorial-product-grid">
            {products.map((product, index) => (
              <ProductCard product={product} store={store} index={index} key={product.id} />
            ))}
          </div>
        ) : (
          <CatalogEmpty filtered={filtered} />
        )}
      </section>

      <section className="shop-assistance" data-store-motion="section">
        <p>Prefere escolher com ajuda?</p>
        <h2>Conte o que você procura.<br /><em>A Helena cuida do resto.</em></h2>
        {store.whatsappNumber ? (
          <Link href="/loja">Solicitar atendimento <span aria-hidden="true">↗</span></Link>
        ) : (
          <span className="pending-assistance">Atendimento online sendo configurado</span>
        )}
      </section>
    </main>
  );
}
