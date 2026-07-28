import Image from "next/image";
import Link from "next/link";
import { ProductAnalytics } from "@/components/analytics/product-analytics";
import { ProductCardActions } from "@/components/store/product-card-actions";

import type { Product, Store } from "@/types/commerce";

function formatPrice(value: number, store: Store) {
  return new Intl.NumberFormat(store.locale, {
    currency: store.currency,
    style: "currency",
  }).format(value);
}

export function ProductCard({
  index,
  product,
  store,
}: {
  index: number;
  product: Product;
  store: Store;
}) {
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0];
  const priceVisible = store.showPrices && product.price !== null;

  return (
    <article
      className="product-card"
      data-product-id={product.id}
      style={{ "--product-index": index % 8 } as React.CSSProperties}
    >
      <ProductAnalytics categoryId={product.categoryId} productId={product.id} />
      <Link className="product-card-media" href={`/produto/${product.slug}`}>
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.altText}
            width={image.width ?? 900}
            height={image.height ?? 1100}
            preload={index === 0}
            quality={90}
            sizes="(max-width: 900px) 50vw, 25vw"
          />
        ) : (
          <span className="product-image-missing" aria-label="Imagem ainda não cadastrada">
            <i />
            Imagem em preparação
          </span>
        )}
        <span className="product-badges">
          {product.newArrival ? <small>Novo</small> : null}
          {product.featured ? <small>Destaque</small> : null}
          {product.status === "sold_out" ? <small>Indisponível</small> : null}
        </span>
        {product.shortDescription ? (
          <span className="product-card-description">{product.shortDescription}</span>
        ) : null}
      </Link>
      <div className="product-card-copy">
        <p>{product.category?.name ?? "Helena Joias"}</p>
        <h3><Link href={`/produto/${product.slug}`}>{product.name}</Link></h3>
        <div className="product-card-buy-row">
          <strong>{priceVisible ? formatPrice(product.price!, store) : "Consulte pelo WhatsApp"}</strong>
          <div>
            <Link href={`/produto/${product.slug}`}>Ver detalhes</Link>
            <ProductCardActions
              item={{
                imageAlt: image?.altText ?? null,
                imageUrl: image?.url ?? null,
                name: product.name,
                price: priceVisible ? product.price : null,
                productId: product.id,
                quantity: 1,
                slug: product.slug,
                status: product.status === "sold_out" ? "sold_out" : "active",
                variationId: null,
                variationName: null,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
