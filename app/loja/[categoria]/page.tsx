import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogEmpty } from "@/components/store/catalog-empty";
import { CategoryRail } from "@/components/store/category-rail";
import { ProductCard } from "@/components/store/product-card";
import { getStore, listCategories, listProducts } from "@/lib/catalog/repository";
import { resolveStoreContext } from "@/lib/store/context";
import { siteUrl } from "@/app/seo";
import { PageEvent } from "@/components/analytics/page-event";

type PageProps = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const context = await resolveStoreContext();
  const categories = await listCategories(context);
  const current = categories.find((item) => item.slug === categoria);
  if (!current) return { title: "Categoria não encontrada" };

  return {
    title: current.name,
    description:
      current.description ??
      `Explore a seleção de ${current.name.toLowerCase()} da Helena Joias.`,
    alternates: { canonical: `/loja/${current.slug}` },
    openGraph: {
      title: `${current.name} | Helena Joias`,
      description:
        current.description ??
        `Explore a seleção de ${current.name.toLowerCase()} da Helena Joias.`,
      url: `/loja/${current.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoria: slug } = await params;
  const context = await resolveStoreContext();
  const [store, categories] = await Promise.all([
    getStore(context),
    listCategories(context),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const products = await listProducts(context, { category: category.slug });

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Loja", item: `${siteUrl}/loja` },
          { "@type": "ListItem", position: 3, name: category.name, item: `${siteUrl}/loja/${category.slug}` },
        ],
      },
      {
        "@type": "ItemList",
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.name,
          url: `${siteUrl}/produto/${product.slug}`,
        })),
      },
    ],
  };

  return (
    <main className="category-page">
      <PageEvent categoryId={category.id} eventName="category_view" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="store-breadcrumbs" aria-label="Navegação estrutural">
        <Link href="/loja">Loja</Link><span>/</span><span>{category.name}</span>
      </nav>
      <section className="category-opening">
        <p>Categoria · {String(category.sortOrder + 1).padStart(2, "0")}</p>
        <h1>{category.name}</h1>
        <span>{category.description ?? "Uma seleção dedicada a essa forma de brilhar."}</span>
      </section>
      <CategoryRail categories={categories} currentSlug={category.slug} />
      <section className="category-products" aria-labelledby="category-selection-title">
        <div className="catalog-topline">
          <div className="store-section-heading">
            <p>Curadoria Helena</p>
            <h2 id="category-selection-title">Seleção de {category.name.toLowerCase()}</h2>
          </div>
          <span>{products.length} {products.length === 1 ? "peça" : "peças"}</span>
        </div>
        {products.length ? (
          <div className="editorial-product-grid">
            {products.map((product, index) => (
              <ProductCard product={product} store={store} index={index} key={product.id} />
            ))}
          </div>
        ) : (
          <CatalogEmpty />
        )}
      </section>
    </main>
  );
}
