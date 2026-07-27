"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import type { CartItem } from "@/lib/cart/types";

export function ProductCardActions({ item }: { item: CartItem }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const unavailable = item.status === "sold_out";

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 2_200);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <button
      className="product-card-add"
      type="button"
      disabled={unavailable}
      onClick={() => {
        addItem({ ...item, quantity: 1 });
        setAdded(true);
      }}
      aria-label={unavailable ? `${item.name} está indisponível` : `Adicionar ${item.name} à sacola`}
    >
      {unavailable ? "Indisponível" : added ? "Adicionado ✓" : "Adicionar à sacola"}
    </button>
  );
}
