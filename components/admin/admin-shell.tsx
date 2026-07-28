import Link from "next/link";

import type { AdminSession } from "@/lib/auth/admin";
import { logoutAction } from "@/app/admin/login/actions";

const adminLinks = [
  { href: "/admin", label: "Visão geral", roles: ["admin", "editor", "attendant"] },
  { href: "/admin/produtos", label: "Produtos", roles: ["admin", "editor"] },
  { href: "/admin/categorias", label: "Categorias", roles: ["admin", "editor"] },
  { href: "/admin/analytics", label: "Analytics", roles: ["admin"] },
  { href: "/admin/configuracoes", label: "Configurações", roles: ["admin"] },
] satisfies Array<{
  href: string;
  label: string;
  roles: AdminSession["role"][];
}>;

export function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AdminSession;
}) {
  const visibleLinks = adminLinks.filter((link) => link.roles.includes(session.role));

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          <span>Helena</span><small>Administração</small>
        </Link>
        <nav aria-label="Administração">
          {visibleLinks.map((link) => (
            <Link href={link.href} key={link.href}>{link.label}</Link>
          ))}
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
              {visibleLinks.map((link) => (
                <Link href={link.href} key={link.href}>{link.label}</Link>
              ))}
            </nav>
          </details>
        </header>
        {children}
      </div>
    </div>
  );
}
