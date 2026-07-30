import Link from "next/link";

import { CartCountButton } from "@/components/cart/cart-count-button";
import { StoreMotion } from "@/components/store/store-motion";
import { brandHighlight } from "@/lib/brand/copy";

export function StoreHeader() {
  return (
    <>
      <StoreMotion />
      <p className="store-campaign-highlight">{brandHighlight}</p>
      <header className="store-header">
        <Link className="store-brand" href="/loja" aria-label="Helena Joias — loja">
          {/* Static brand asset: direct loading avoids an unnecessary optimizer hop. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/logo-transparent.png" alt="" width="828" height="828" />
        </Link>
        <nav className="store-nav" aria-label="Navegação da loja">
          <Link href="/loja">Loja</Link>
          <Link href="/loja#categorias">Categorias</Link>
        </nav>
        <div className="store-header-actions">
          <details className="store-menu">
            <summary aria-label="Abrir menu"><i /><i /></summary>
            <nav aria-label="Menu mobile">
              <Link href="/loja">Loja</Link>
              <Link href="/loja#categorias">Categorias</Link>
            </nav>
          </details>
          <CartCountButton />
        </div>
      </header>
    </>
  );
}
