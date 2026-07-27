import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPurchaseActions } from "@/components/cart/product-purchase-actions";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { getProductBySlug, getStore, listProducts } from "@/lib/catalog/repository";
import { resolveStoreContext } from "@/lib/store/context";
import { siteUrl } from "@/app/seo";
import { PageEvent } from "@/components/analytics/page-event";

type ProductPageProps = { params: Promise<{ slug: string }> };

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { currency, style: "currency" }).format(value);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const context = await resolveStoreContext();
  const product = await getProductBySlug(context, slug);
  if (!product) return { title: "Peça não encontrada" };
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0];

  return {
    title: product.name,
    description:
      product.shortDescription ??
      `Conheça ${product.name}, uma peça da curadoria Helena Joias.`,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description:
        product.shortDescription ??
        `Conheça ${product.name}, uma peça da curadoria Helena Joias.`,
      url: `/produto/${product.slug}`,
      images: image?.url ? [image.url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: image?.url ? [image.url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const context = await resolveStoreContext();
  const [store, product] = await Promise.all([
    getStore(context),
    getProductBySlug(context, slug),
  ]);
  if (!product) notFound();

  const related = product.category
    ? (await listProducts(context, { category: product.category.slug }, 1, 5))
        .filter((item) => item.id !== product.id)
        .slice(0, 4)
    : [];
  const priceVisible = store.showPrices && product.price !== null;
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0];
  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.shortDescription ?? undefined,
    image: product.images.flatMap((item) => (item.url ? [item.url] : [])),
    sku: product.sku ?? undefined,
    url: `${siteUrl}/produto/${product.slug}`,
  };
  if (priceVisible) {
    productSchema.offers = {
      "@type": "Offer",
      price: product.price,
      priceCurrency: store.currency,
      url: `${siteUrl}/produto/${product.slug}`,
      availability:
        product.status === "sold_out"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    };
  }

  return (
    <main className="product-page">
      <PageEvent categoryId={product.categoryId} eventName="product_view" productId={product.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="store-breadcrumbs" aria-label="Navegação estrutural">
        <Link href="/loja">Loja</Link><span>/</span>
        {product.category ? (
          <><Link href={`/loja/${product.category.slug}`}>{product.category.name}</Link><span>/</span></>
        ) : null}
        <span>{product.name}</span>
      </nav>
      <section className="product-detail">
        <ProductGallery
          images={product.images.length ? product.images : image ? [image] : []}
          productName={product.name}
        />
        <div className="product-information">
          <p>{product.category?.name ?? "Curadoria Helena"}</p>
          <h1>{product.name}</h1>
          {product.shortDescription ? <h2>{product.shortDescription}</h2> : null}
          <div className="product-price">
            <strong>
              {priceVisible
                ? formatPrice(product.price!, store.locale, store.currency)
                : "Valor sob consulta"}
            </strong>
            {product.compareAtPrice && priceVisible ? (
              <s>{formatPrice(product.compareAtPrice, store.locale, store.currency)}</s>
            ) : null}
          </div>
          <p className={`product-status status-${product.status}`}>
            <i /> {product.status === "sold_out" ? "Peça indisponível no momento" : "Disponibilidade confirmada no atendimento"}
          </p>
          {product.description ? <div className="product-description">{product.description}</div> : null}
          <ProductPurchaseActions product={product} store={store} />
          {product.category ? (
            <Link className="back-to-category" href={`/loja/${product.category.slug}`}>
              ← Voltar para {product.category.name.toLowerCase()}
            </Link>
          ) : null}
        </div>
      </section>
      {related.length ? (
        <section className="related-products" aria-labelledby="related-title">
          <div className="store-section-heading">
            <p>Continue explorando</p>
            <h2 id="related-title">Outras peças<br /><em>na mesma forma.</em></h2>
          </div>
          <div className="editorial-product-grid">
            {related.map((item, index) => (
              <ProductCard product={item} store={store} index={index} key={item.id} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
