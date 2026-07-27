import Link from "next/link";

import type { AdminSession } from "@/lib/auth/admin";
import { logoutAction } from "@/app/admin/login/actions";

export function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AdminSession;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          <span>Helena</span><small>Administração</small>
        </Link>
        <nav aria-label="Administração">
          <Link href="/admin">Visão geral</Link>
          <Link href="/admin/produtos">Produtos</Link>
          <Link href="/admin/categorias">Categorias</Link>
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/configuracoes">Configurações</Link>
        </nav>
        <div className="admin-user">
          <p>{session.name}</p>
          <span>{session.role}</span>
          <form action={logoutAction}><button type="submit">Sair</button></form>
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-mobile-header">
          <Link href="/admin">Helena · Admin</Link>
          <details>
            <summary>Menu</summary>
            <nav>
              <Link href="/admin">Visão geral</Link>
              <Link href="/admin/produtos">Produtos</Link>
              <Link href="/admin/categorias">Categorias</Link>
              <Link href="/admin/analytics">Analytics</Link>
              <Link href="/admin/configuracoes">Configurações</Link>
            </nav>
          </details>
        </header>
        {children}
      </div>
    </div>
  );
}

