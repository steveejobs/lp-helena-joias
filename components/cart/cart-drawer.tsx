"use client";

import Link from "next/link";
import { useEffect } from "react";

import { cartSubtotal } from "@/lib/whatsapp/order-message";
import { CartCheckoutButton } from "./cart-checkout-button";
import { CartLine } from "./cart-line";
import { useCart } from "./cart-provider";

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { currency, style: "currency" }).format(value);
}

export function CartDrawer() {
  const { closeDrawer, isDrawerOpen, items, store } = useCart();
  const subtotal = cartSubtotal(items);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closeDrawer, isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div className="cart-drawer-layer">
      <button className="cart-drawer-backdrop" type="button" onClick={closeDrawer} aria-label="Fechar sacola" />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <header>
          <div>
            <p>Sua seleção</p>
            <h2 id="cart-drawer-title">Sacola</h2>
          </div>
          <button type="button" onClick={closeDrawer} aria-label="Fechar sacola">Fechar ×</button>
        </header>
        <div className="cart-drawer-content">
          {items.length ? (
            items.map((item) => <CartLine item={item} key={`${item.productId}:${item.variationId}`} />)
          ) : (
            <div className="cart-drawer-empty">
              <i aria-hidden="true" />
              <h3>Sua sacola está leve.</h3>
              <p>Explore a curadoria e guarde aqui as peças que combinam com você.</p>
              <Link href="/loja" onClick={closeDrawer}>Explorar peças</Link>
            </div>
          )}
        </div>
        {items.length ? (
          <footer>
            <div>
              <span>{subtotal === null ? "Valores a confirmar" : "Subtotal informado"}</span>
              <strong>
                {subtotal === null
                  ? "Consulte no atendimento"
                  : formatPrice(subtotal, store.locale, store.currency)}
              </strong>
            </div>
            <CartCheckoutButton items={items} origin="sacola lateral" store={store} />
            <Link href="/carrinho" onClick={closeDrawer}>Ver sacola completa</Link>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

