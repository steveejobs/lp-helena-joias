import type { Metadata } from "next";
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
        <div>
          <p>Curadoria Helena · Loja online</p>
          <h1 id="shop-title">Peças para<br /><em>brilhar à sua maneira.</em></h1>
        </div>
        <p>
          Explore com calma. Escolha seus favoritos e converse com a Helena
          para confirmar disponibilidade e atendimento.
        </p>
        <Link href="#colecao-completa">Ver a seleção <span aria-hidden="true">↓</span></Link>
      </section>

      <section className="shop-categories" aria-labelledby="categories-title">
        <div className="store-section-heading">
          <p>Escolha por forma</p>
          <h2 id="categories-title">Encontre o detalhe<br /><em>que fala por você.</em></h2>
        </div>
        <StoreButterfly />
        <CategoryRail categories={categories} />
      </section>

      {products.some((product) => product.featured) ? (
        <section className="featured-products" aria-labelledby="featured-title">
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

      <section className="catalog-section" id="colecao-completa" aria-labelledby="catalog-title">
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

      <section className="shop-assistance">
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
