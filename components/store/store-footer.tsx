import Link from "next/link";
import { CookieSettingsButton } from "@/components/analytics/cookie-settings-button";
import { brandHighlight } from "@/lib/brand/copy";

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div>
        <p>Helena Joias</p>
        <h2>{brandHighlight}</h2>
      </div>
      <nav aria-label="Links da loja">
        <Link href="/loja">Loja</Link>
        <Link href="/carrinho">Sacola</Link>
        <Link href="/privacidade">Privacidade</Link>
        <CookieSettingsButton />
      </nav>
      <p>Atendimento e disponibilidade são confirmados diretamente com a Helena.</p>
      <small>© {new Date().getFullYear()} Helena Joias</small>
    </footer>
  );
}
