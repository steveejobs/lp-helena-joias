export const CART_STORAGE_KEY = "helena.cart";
export const CART_STATE_VERSION = 1;

export type CartItem = {
  imageAlt: string | null;
  imageUrl: string | null;
  name: string;
  price: number | null;
  productId: string;
  quantity: number;
  slug: string;
  status: "active" | "sold_out";
  variationId: string | null;
  variationName: string | null;
};

export type CartState = {
  items: CartItem[];
  version: typeof CART_STATE_VERSION;
};

export function cartItemKey(item: Pick<CartItem, "productId" | "variationId">) {
  return `${item.productId}:${item.variationId ?? "base"}`;
}

