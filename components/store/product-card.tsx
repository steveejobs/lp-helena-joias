import Image from "next/image";
import Link from "next/link";
import { ProductAnalytics } from "@/components/analytics/product-analytics";

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
      className={`product-card ${index % 7 === 0 ? "product-card-feature" : ""}`}
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
            priority={index < 4}
            sizes={index % 7 === 0 ? "(max-width: 760px) 100vw, 48vw" : "(max-width: 760px) 50vw, 25vw"}
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
      </Link>
      <div className="product-card-copy">
        <p>{product.category?.name ?? "Helena Joias"}</p>
        <h3><Link href={`/produto/${product.slug}`}>{product.name}</Link></h3>
        {product.shortDescription ? <span>{product.shortDescription}</span> : null}
        <div>
          <strong>{priceVisible ? formatPrice(product.price!, store) : "Consulte pelo WhatsApp"}</strong>
          <Link href={`/produto/${product.slug}`} aria-label={`Ver ${product.name}`}>↗</Link>
        </div>
      </div>
    </article>
  );
}
