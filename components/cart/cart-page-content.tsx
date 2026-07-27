"use client";

import Link from "next/link";

import { cartSubtotal } from "@/lib/whatsapp/order-message";
import { CartCheckoutButton } from "./cart-checkout-button";
import { CartLine } from "./cart-line";
import { useCart } from "./cart-provider";
import { PageEvent } from "@/components/analytics/page-event";

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { currency, style: "currency" }).format(value);
}

export function CartPageContent() {
  const { clear, hydrated, items, store } = useCart();
  const subtotal = cartSubtotal(items);

  if (!hydrated) {
    return (
      <main className="cart-page" aria-busy="true">
        <div className="store-skeleton store-skeleton-heading" />
      </main>
    );
  }

  return (
    <main className="cart-page">
      <PageEvent eventName="cart_viewed" />
      <header className="cart-page-heading">
        <p>Sua seleção Helena</p>
        <h1>Sacola</h1>
        <span>{items.reduce((total, item) => total + item.quantity, 0)} itens</span>
      </header>
      {items.length ? (
        <div className="cart-page-layout">
          <section className="cart-page-items" aria-label="Itens da sacola">
            {items.map((item) => (
              <CartLine item={item} key={`${item.productId}:${item.variationId}`} />
            ))}
            <div className="cart-page-list-actions">
              <Link href="/loja">← Continuar explorando</Link>
              <button type="button" onClick={clear}>Limpar sacola</button>
            </div>
          </section>
          <aside className="cart-summary">
            <p>Resumo da seleção</p>
            <div>
              <span>{subtotal === null ? "Valores" : "Subtotal informado"}</span>
              <strong>
                {subtotal === null
                  ? "A confirmar"
                  : formatPrice(subtotal, store.locale, store.currency)}
              </strong>
            </div>
            <small>
              Disponibilidade, valores e atendimento serão confirmados diretamente
              com a Helena. Esta etapa não é um pagamento.
            </small>
            <CartCheckoutButton items={items} origin="página da sacola" store={store} />
          </aside>
        </div>
      ) : (
        <section className="cart-page-empty">
          <i aria-hidden="true" />
          <p>Sua sacola está vazia</p>
          <h2>Escolha no seu tempo.<br /><em>O brilho encontra você.</em></h2>
          <Link href="/loja">Explorar peças <span aria-hidden="true">→</span></Link>
        </section>
      )}
    </main>
  );
}
