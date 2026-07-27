"use client";

import Image from "next/image";
import Link from "next/link";

import { cartItemKey, type CartItem } from "@/lib/cart/types";
import type { Store } from "@/types/commerce";
import { useCart } from "./cart-provider";

function formatPrice(value: number, store: Store) {
  return new Intl.NumberFormat(store.locale, {
    currency: store.currency,
    style: "currency",
  }).format(value);
}

export function CartLine({ item }: { item: CartItem }) {
  const { decrement, increment, removeItem, store } = useCart();
  const key = cartItemKey(item);

  return (
    <article className="cart-line">
      <Link className="cart-line-image" href={`/produto/${item.slug}`}>
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt ?? ""}
            width={180}
            height={220}
            sizes="100px"
          />
        ) : (
          <span aria-label="Imagem não cadastrada"><i /></span>
        )}
      </Link>
      <div className="cart-line-copy">
        <p>Helena Joias</p>
        <h3><Link href={`/produto/${item.slug}`}>{item.name}</Link></h3>
        {item.variationName ? <span>Variação: {item.variationName}</span> : null}
        <strong>
          {store.showPrices && item.price !== null
            ? formatPrice(item.price, store)
            : "Valor sob consulta"}
        </strong>
        <div className="cart-line-actions">
          <div aria-label={`Quantidade de ${item.name}`}>
            <button type="button" onClick={() => decrement(key)} aria-label="Diminuir quantidade">−</button>
            <span>{item.quantity}</span>
            <button type="button" onClick={() => increment(key)} aria-label="Aumentar quantidade">+</button>
          </div>
          <button type="button" onClick={() => removeItem(key)}>Remover</button>
        </div>
      </div>
    </article>
  );
}

