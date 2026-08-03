"use client";

import { trackAnalyticsEvent } from "@/lib/analytics/client";
import {
  HELENA_WHATSAPP_NUMBER,
  HELENA_WHATSAPP_SITE_MESSAGE,
} from "@/lib/whatsapp/order-message";

export function HomeWhatsAppButton({
  className = "whatsapp-spotlight",
  origin,
}: {
  className?: string;
  origin: string;
}) {
  const open = async () => {
    const pending = window.open("", "_blank");
    if (pending) pending.opener = null;
    await trackAnalyticsEvent({ eventName: "whatsapp_opened", metadata: { origin } });
    const url = `https://wa.me/${HELENA_WHATSAPP_NUMBER}?text=${encodeURIComponent(HELENA_WHATSAPP_SITE_MESSAGE)}`;
    if (pending) pending.location.href = url;
    else window.location.assign(url);
  };

  return (
    <button
      className={className}
      type="button"
      onClick={open}
      aria-label="Falar no WhatsApp"
    >
      <span className="whatsapp-copy">
        <strong>Falar no WhatsApp</strong>
        <small>Atendimento direto</small>
      </span>
      <span className="whatsapp-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M20 11.6a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4.1A8 8 0 1 1 20 11.6Z" />
          <path d="M8.4 7.8c.3-.3.7-.2.9.1l1 1.8c.1.3.1.6-.1.8l-.7.7c.6 1.4 1.7 2.5 3.1 3.1l.7-.7c.2-.2.5-.3.8-.1l1.8 1c.3.2.4.6.1.9-.6.8-1.5 1.2-2.5 1.1-3.2-.4-6.3-3.5-6.7-6.7-.1-1 .3-1.9 1.1-2.5Z" />
        </svg>
      </span>
    </button>
  );
}
