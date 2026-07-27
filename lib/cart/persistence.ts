import {
  CART_STATE_VERSION,
  type CartItem,
  type CartState,
} from "./types.ts";

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.length <= 500 ? value : null;
}

function validItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.productId !== "string" ||
    typeof item.slug !== "string" ||
    typeof item.name !== "string" ||
    (item.status !== "active" && item.status !== "sold_out")
  ) {
    return null;
  }

  const quantity =
    typeof item.quantity === "number" && Number.isFinite(item.quantity)
      ? Math.min(99, Math.max(1, Math.floor(item.quantity)))
      : 1;
  const price =
    typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0
      ? item.price
      : null;

  return {
    imageAlt: stringOrNull(item.imageAlt),
    imageUrl: stringOrNull(item.imageUrl),
    name: item.name.slice(0, 180),
    price,
    productId: item.productId,
    quantity,
    slug: item.slug.slice(0, 180),
    status: item.status,
    variationId: stringOrNull(item.variationId),
    variationName: stringOrNull(item.variationName),
  };
}

export function parseStoredCart(raw: string | null): CartState {
  if (!raw) return { items: [], version: CART_STATE_VERSION };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { items: [], version: CART_STATE_VERSION };
    }
    const candidate = parsed as Record<string, unknown>;
    if (candidate.version !== CART_STATE_VERSION || !Array.isArray(candidate.items)) {
      return migrateCart(candidate);
    }

    return {
      items: candidate.items.flatMap((item) => {
        const valid = validItem(item);
        return valid ? [valid] : [];
      }).slice(0, 100),
      version: CART_STATE_VERSION,
    };
  } catch {
    return { items: [], version: CART_STATE_VERSION };
  }
}

function migrateCart(candidate: Record<string, unknown>): CartState {
  // Future versions are migrated here without coupling storage to the UI.
  void candidate;
  return { items: [], version: CART_STATE_VERSION };
}
