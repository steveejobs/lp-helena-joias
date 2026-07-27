"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { parseStoredCart } from "@/lib/cart/persistence";
import {
  CART_STATE_VERSION,
  CART_STORAGE_KEY,
  cartItemKey,
  type CartItem,
  type CartState,
} from "@/lib/cart/types";
import type { Store } from "@/types/commerce";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

type CartContextValue = {
  addItem: (item: CartItem) => void;
  clear: () => void;
  closeDrawer: () => void;
  count: number;
  decrement: (key: string) => void;
  hydrated: boolean;
  increment: (key: string) => void;
  isDrawerOpen: boolean;
  items: CartItem[];
  openDrawer: () => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  store: Store;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store: Store;
}) {
  const [state, setState] = useState<CartState>({
    items: [],
    version: CART_STATE_VERSION,
  });
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const addItem = useCallback((item: CartItem) => {
    setState((current) => {
      const key = cartItemKey(item);
      const existing = current.items.find((candidate) => cartItemKey(candidate) === key);
      const items = existing
        ? current.items.map((candidate) =>
            cartItemKey(candidate) === key
              ? { ...candidate, quantity: Math.min(99, candidate.quantity + item.quantity) }
              : candidate,
          )
        : [...current.items, { ...item, quantity: Math.min(99, Math.max(1, item.quantity)) }];
      return { items, version: CART_STATE_VERSION };
    });
    setNotice(`${item.name} foi adicionada à sacola.`);
    void trackAnalyticsEvent({
      eventName: "add_to_cart",
      metadata: { quantity: item.quantity, variation: item.variationName ?? null },
      productId: item.productId,
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    const safeQuantity = Math.min(99, Math.max(1, Math.floor(quantity)));
    const item = state.items.find((candidate) => cartItemKey(candidate) === key);
    setState((current) => ({
      ...current,
      items: current.items.map((item) =>
        cartItemKey(item) === key ? { ...item, quantity: safeQuantity } : item,
      ),
    }));
    if (item) void trackAnalyticsEvent({
      eventName: "quantity_changed",
      metadata: { from: item.quantity, to: safeQuantity },
      productId: item.productId,
    });
  }, [state.items]);

  const removeItem = useCallback((key: string) => {
    const item = state.items.find((candidate) => cartItemKey(candidate) === key);
    setState((current) => ({
      ...current,
      items: current.items.filter((item) => cartItemKey(item) !== key),
    }));
    if (item) void trackAnalyticsEvent({
      eventName: "remove_from_cart",
      metadata: { quantity: item.quantity },
      productId: item.productId,
    });
  }, [state.items]);

  const increment = useCallback((key: string) => {
    const item = state.items.find((candidate) => cartItemKey(candidate) === key);
    setState((current) => ({
      ...current,
      items: current.items.map((item) =>
        cartItemKey(item) === key
          ? { ...item, quantity: Math.min(99, item.quantity + 1) }
          : item,
      ),
    }));
    if (item) void trackAnalyticsEvent({
      eventName: "quantity_changed",
      metadata: { from: item.quantity, to: Math.min(99, item.quantity + 1) },
      productId: item.productId,
    });
  }, [state.items]);

  const decrement = useCallback((key: string) => {
    const item = state.items.find((candidate) => cartItemKey(candidate) === key);
    setState((current) => ({
      ...current,
      items: current.items.flatMap((item) => {
        if (cartItemKey(item) !== key) return [item];
        return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
      }),
    }));
    if (item) void trackAnalyticsEvent({
      eventName: item.quantity > 1 ? "quantity_changed" : "remove_from_cart",
      metadata: item.quantity > 1
        ? { from: item.quantity, to: item.quantity - 1 }
        : { quantity: item.quantity },
      productId: item.productId,
    });
  }, [state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      addItem,
      clear: () => {
        const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
        setState({ items: [], version: CART_STATE_VERSION });
        if (itemCount) void trackAnalyticsEvent({
          eventName: "cart_cleared",
          metadata: { item_count: itemCount },
        });
      },
      closeDrawer: () => setDrawerOpen(false),
      count: state.items.reduce((total, item) => total + item.quantity, 0),
      decrement,
      hydrated,
      increment,
      isDrawerOpen,
      items: state.items,
      openDrawer: () => {
        setDrawerOpen(true);
        void trackAnalyticsEvent({ eventName: "cart_viewed", metadata: { source: "drawer" } });
      },
      removeItem,
      setQuantity,
      store,
    }),
    [
      addItem,
      decrement,
      hydrated,
      increment,
      isDrawerOpen,
      removeItem,
      setQuantity,
      state.items,
      store,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      {notice ? <div className="cart-notice" role="status">{notice}</div> : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider.");
  return context;
}
