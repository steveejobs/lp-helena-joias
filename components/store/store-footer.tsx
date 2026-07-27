import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div>
        <p>Helena Joias</p>
        <h2>Seu brilho,<br /><em>na sua forma.</em></h2>
      </div>
      <nav aria-label="Links da loja">
        <Link href="/">Início</Link>
        <Link href="/loja">Loja</Link>
        <Link href="/instagram">Instagram</Link>
        <Link href="/carrinho">Sacola</Link>
      </nav>
      <p>Atendimento e disponibilidade são confirmados diretamente com a Helena.</p>
      <small>© {new Date().getFullYear()} Helena Joias</small>
    </footer>
  );
}

