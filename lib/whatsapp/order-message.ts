import type { CartItem } from "@/lib/cart/types";
import type { Store } from "@/types/commerce";

export function normalizeWhatsAppNumber(value: string | null) {
  if (!value) return null;
  let digits = value.replace(/\D/g, "");
  if (!digits) return null;
  digits = digits.replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

function formatMoney(value: number, store: Store) {
  return new Intl.NumberFormat(store.locale, {
    currency: store.currency,
    style: "currency",
  }).format(value);
}

export function cartSubtotal(items: CartItem[]) {
  if (!items.length || items.some((item) => item.price === null)) return null;
  return items.reduce((total, item) => total + item.price! * item.quantity, 0);
}

export function buildWhatsAppMessage({
  items,
  origin,
  siteOrigin,
  store,
}: {
  items: CartItem[];
  origin: string;
  siteOrigin: string;
  store: Store;
}) {
  const defaultOpening =
    `Olá! Vim pela loja online da ${store.name} e gostaria de conferir esta seleção:`;
  const opening = store.whatsappDefaultMessage?.trim() || defaultOpening;
  const itemBlocks = items.map((item) => {
    const lines = [
      item.name,
      `Quantidade: ${item.quantity}`,
      item.variationName ? `Variação: ${item.variationName}` : null,
      `Valor: ${item.price === null ? "consultar" : formatMoney(item.price, store)}`,
      `Link: ${siteOrigin}/produto/${item.slug}`,
    ];
    return lines.filter(Boolean).join("\n");
  });
  const subtotal = cartSubtotal(items);
  const closing = [
    subtotal === null ? null : `Subtotal informado: ${formatMoney(subtotal, store)}`,
    "Gostaria de confirmar disponibilidade, valores e atendimento.",
    `Origem: ${origin}`,
  ].filter(Boolean);

  return [opening, ...itemBlocks, ...closing].join("\n\n");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

