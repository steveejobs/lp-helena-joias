import Link from "next/link";

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="privacy-shell">
      <header className="privacy-nav">
        <Link href="/" aria-label="Voltar para a página inicial da Helena Joias">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/logo-transparent.png" alt="" width="828" height="828" />
          <span>Helena <small>Joias</small></span>
        </Link>
        <Link href="/">Voltar ao site</Link>
      </header>
      {children}
      <footer className="privacy-footer">
        <p>Helena Joias</p>
        <span>Beleza, brilho e presença.</span>
        <small>© {new Date().getFullYear()} Helena Joias</small>
      </footer>
    </div>
  );
}
