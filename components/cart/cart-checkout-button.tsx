"use client";

import { trackAnalyticsEvent } from "@/lib/analytics/client";
import type { CartItem } from "@/lib/cart/types";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp/order-message";
import type { Store } from "@/types/commerce";

export function CartCheckoutButton({
  className,
  items,
  origin,
  store,
}: {
  className?: string;
  items: CartItem[];
  origin: string;
  store: Store;
}) {
  const phone = normalizeWhatsAppNumber(store.whatsappNumber);
  const disabled = !phone || !items.length;

  const beginCheckout = async () => {
    if (!phone || !items.length) return;
    const message = buildWhatsAppMessage({
      items,
      origin,
      siteOrigin: window.location.origin,
      store,
    });
    const pendingWindow = window.open("", "_blank");
    if (pendingWindow) pendingWindow.opener = null;

    await trackAnalyticsEvent({
      eventName: "begin_whatsapp_checkout",
      metadata: {
        item_count: items.reduce((total, item) => total + item.quantity, 0),
        origin,
      },
    });
    await Promise.all(items.map((item) => trackAnalyticsEvent({
      eventName: "checkout_product",
      metadata: { origin, quantity: item.quantity, variation: item.variationName },
      productId: item.productId,
    })));
    const url = buildWhatsAppUrl(phone, message);
    if (pendingWindow) {
      pendingWindow.location.href = url;
    } else {
      window.location.assign(url);
    }
    void trackAnalyticsEvent({
      eventName: "whatsapp_opened",
      metadata: { origin },
    });
  };

  return (
    <button className={className} type="button" disabled={disabled} onClick={beginCheckout}>
      {!phone ? "Atendimento sendo configurado" : "Conferir pedido no WhatsApp"}
    </button>
  );
}
