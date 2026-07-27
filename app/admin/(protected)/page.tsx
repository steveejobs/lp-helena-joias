import Link from "next/link";

import { requireAdminSession } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID } from "@/types/commerce";

export default async function AdminDashboard() {
  const session = await requireAdminSession("/admin");
  const supabase = await createSupabaseServerClient();
  const [products, active, categories, events] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", HELENA_STORE_ID),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", HELENA_STORE_ID).eq("status", "active"),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("store_id", HELENA_STORE_ID),
    supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("store_id", HELENA_STORE_ID),
  ]);

  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <div><p>Visão geral</p><h1>Olá, {session.name.split(" ")[0]}.</h1></div>
        <Link className="admin-primary-action" href="/admin/produtos/novo">Cadastrar produto</Link>
      </header>
      <section className="admin-metrics" aria-label="Resumo da loja">
        <article><span>Produtos</span><strong>{products.count ?? 0}</strong><small>cadastrados</small></article>
        <article><span>Publicados</span><strong>{active.count ?? 0}</strong><small>na vitrine</small></article>
        <article><span>Categorias</span><strong>{categories.count ?? 0}</strong><small>ativas e inativas</small></article>
        <article><span>Eventos</span><strong>{events.count ?? 0}</strong><small>first-party</small></article>
      </section>
      <section className="admin-quick-links">
        <div><p>Operação</p><h2>O essencial,<br />sem ruído.</h2></div>
        <Link href="/admin/produtos"><span>01</span><strong>Gerenciar produtos</strong><i>→</i></Link>
        <Link href="/admin/categorias"><span>02</span><strong>Organizar categorias</strong><i>→</i></Link>
        <Link href="/admin/configuracoes"><span>03</span><strong>Configurar atendimento</strong><i>→</i></Link>
        <Link href="/admin/analytics"><span>04</span><strong>Acompanhar interesse</strong><i>→</i></Link>
      </section>
    </main>
  );
}

