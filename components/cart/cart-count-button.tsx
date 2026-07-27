"use client";

import { BagIcon } from "@/components/store/bag-icon";
import { useCart } from "./cart-provider";

export function CartCountButton() {
  const { count, hydrated, openDrawer } = useCart();
  const visibleCount = hydrated ? count : 0;

  return (
    <button
      className="store-bag-link"
      type="button"
      onClick={openDrawer}
      aria-label={`Abrir sacola, ${visibleCount} ${visibleCount === 1 ? "item" : "itens"}`}
    >
      <BagIcon />
      <span>{visibleCount}</span>
    </button>
  );
}

