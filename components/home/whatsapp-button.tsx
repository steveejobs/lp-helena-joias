"use client";

import { useCart } from "@/components/cart/cart-provider";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp/order-message";

export function HomeWhatsAppButton({
  className = "whatsapp-spotlight",
  origin,
}: {
  className?: string;
  origin: string;
}) {
  const { store } = useCart();
  const phone = normalizeWhatsAppNumber(store.whatsappNumber);

  const open = async () => {
    if (!phone) return;
    const message = store.whatsappDefaultMessage?.trim()
      || `Olá! Vim pelo site da ${store.name} e gostaria de solicitar atendimento.`;
    const pending = window.open("", "_blank");
    if (pending) pending.opener = null;
    await trackAnalyticsEvent({ eventName: "whatsapp_opened", metadata: { origin } });
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    if (pending) pending.location.href = url;
    else window.location.assign(url);
  };

  return (
    <button
      className={className}
      type="button"
      disabled={!phone}
      onClick={open}
      aria-label={phone ? "Falar no WhatsApp" : "Falar no WhatsApp — atendimento sendo configurado"}
    >
      <span className="whatsapp-icon" aria-hidden="true">◌</span>
      <span>{phone ? "Falar no WhatsApp" : "Falar no WhatsApp · em breve"}</span>
    </button>
  );
}
