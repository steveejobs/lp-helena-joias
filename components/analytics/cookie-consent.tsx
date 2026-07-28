"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getAnalyticsConsent,
  OPEN_COOKIE_SETTINGS_EVENT,
  saveAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/consent";

export function CookieConsent() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<AnalyticsConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = getAnalyticsConsent();
      setChoice(stored);
      setOpen(stored === null);
      setReady(true);
    });
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    };
  }, []);

  if (!ready || !open || pathname.startsWith("/admin")) return null;

  const choose = (nextChoice: AnalyticsConsent) => {
    saveAnalyticsConsent(nextChoice);
    setChoice(nextChoice);
    setOpen(false);
  };

  return (
    <aside
      aria-describedby="cookie-consent-description"
      aria-labelledby="cookie-consent-title"
      className="cookie-consent"
      role="dialog"
    >
      <div className="cookie-consent-copy">
        <p>Privacidade, com transparência</p>
        <h2 id="cookie-consent-title">Uma experiência feita para você.</h2>
        <span id="cookie-consent-description">
          Usamos cookies opcionais para entender visitas, desempenho das peças e melhorar a loja.
          A localização é aproximada por cidade; não usamos GPS nem armazenamos seu IP.
        </span>
        <Link href="/privacidade">Entenda como cuidamos dos dados</Link>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-consent-accept" onClick={() => choose("accepted")}>
          Aceitar cookies
        </button>
        <button type="button" onClick={() => choose("necessary")}>
          Somente necessários
        </button>
        {choice ? (
          <button type="button" className="cookie-consent-close" onClick={() => setOpen(false)}>
            Fechar
          </button>
        ) : null}
      </div>
    </aside>
  );
}
