export const HELENA_WHATSAPP_NUMBER = "5563992233535";
export const HELENA_WHATSAPP_SITE_MESSAGE =
  "Olá! Vim pelo site da Helena Joias e gostaria de solicitar atendimento.";

export function normalizeWhatsAppNumber(value: string | null) {
  if (!value) return null;
  let digits = value.replace(/\D/g, "");
  if (!digits) return null;
  digits = digits.replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

export function buildWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
