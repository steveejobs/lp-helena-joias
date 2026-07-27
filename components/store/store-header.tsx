import Link from "next/link";

import { CartCountButton } from "@/components/cart/cart-count-button";

export function StoreHeader() {
  return (
    <header className="store-header">
      <Link className="store-brand" href="/" aria-label="Helena Joias — início">
        {/* Static brand asset: direct loading avoids an unnecessary optimizer hop. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/logo-transparent.png" alt="" width="828" height="828" />
        <span>Helena <small>Joias</small></span>
      </Link>
      <nav className="store-nav" aria-label="Navegação da loja">
        <Link href="/">Início</Link>
        <Link href="/loja">Loja</Link>
        <Link href="/loja#categorias">Categorias</Link>
        <Link href="/instagram">Instagram</Link>
      </nav>
      <div className="store-header-actions">
        <details className="store-menu">
          <summary aria-label="Abrir menu"><i /><i /></summary>
          <nav aria-label="Menu mobile">
            <Link href="/">Início</Link>
            <Link href="/loja">Loja</Link>
            <Link href="/loja#categorias">Categorias</Link>
            <Link href="/instagram">Instagram</Link>
          </nav>
        </details>
        <CartCountButton />
      </div>
    </header>
  );
}
