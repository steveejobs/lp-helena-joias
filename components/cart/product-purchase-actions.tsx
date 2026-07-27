"use client";

import { useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";
import type { CartItem } from "@/lib/cart/types";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp/order-message";
import type { Product, Store } from "@/types/commerce";
import { useCart } from "./cart-provider";

export function ProductPurchaseActions({ product, store }: { product: Product; store: Store }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const phone = normalizeWhatsAppNumber(store.whatsappNumber);
  const unavailable = product.status === "sold_out";
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0];
  const item: CartItem = {
    imageAlt: image?.altText ?? null,
    imageUrl: image?.url ?? null,
    name: product.name,
    price: store.showPrices ? product.price : null,
    productId: product.id,
    quantity,
    slug: product.slug,
    status: unavailable ? "sold_out" : "active",
    variationId: null,
    variationName: null,
  };

  const add = () => {
    if (unavailable) return;
    addItem(item);
  };

  const requestOnWhatsApp = async () => {
    if (!phone || unavailable) return;
    const message = buildWhatsAppMessage({
      items: [item],
      origin: "página do produto",
      siteOrigin: window.location.origin,
      store,
    });
    const pendingWindow = window.open("", "_blank");
    if (pendingWindow) pendingWindow.opener = null;
    await trackAnalyticsEvent({
      categoryId: product.categoryId,
      eventName: "begin_whatsapp_checkout",
      metadata: { item_count: quantity, origin: "product_page" },
      productId: product.id,
    });
    const url = buildWhatsAppUrl(phone, message);
    if (pendingWindow) pendingWindow.location.href = url;
    else window.location.assign(url);
    void trackAnalyticsEvent({
      eventName: "whatsapp_opened",
      metadata: { origin: "product_page" },
      productId: product.id,
    });
  };

  return (
    <>
      <div className="product-quantity">
        <label htmlFor="product-quantity">Quantidade</label>
        <select id="product-quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
          {[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value}</option>)}
        </select>
      </div>
      <div className="product-actions">
        <button type="button" disabled={unavailable} onClick={add}>
          {unavailable ? "Peça indisponível" : "Adicionar à sacola"}
        </button>
        <button type="button" disabled={!phone || unavailable} onClick={requestOnWhatsApp}>
          {!phone ? "Atendimento sendo configurado" : "Pedir pelo WhatsApp"}
        </button>
      </div>
    </>
  );
}
