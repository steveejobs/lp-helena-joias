import Link from "next/link";

import { requireAdminRole } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID } from "@/types/commerce";

const statusLabel: Record<string, string> = {
  active: "Ativo",
  archived: "Arquivado",
  draft: "Rascunho",
  sold_out: "Indisponível",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminRole(["admin", "editor"], "/admin/produtos");
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,sku,status,price,featured,new_arrival,updated_at,category:categories!products_store_category_fkey(name)")
    .eq("store_id", HELENA_STORE_ID)
    .order("sort_order")
    .order("updated_at", { ascending: false })
    .limit(250);
  if (error) throw new Error("Não foi possível carregar os produtos.");

  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <div><p>Catálogo</p><h1>Produtos</h1></div>
        <Link className="admin-primary-action" href="/admin/produtos/novo">Cadastrar produto</Link>
      </header>
      {params.ok ? <p className="admin-success" role="status">Produto arquivado sem exclusão permanente.</p> : null}
      {products.length === 0 ? (
        <section className="admin-panel admin-empty">
          <h2>A vitrine aguarda as peças reais.</h2>
          <p>Nenhum produto fictício foi publicado. Cadastre a primeira peça com fotos e informações confirmadas.</p>
          <Link className="admin-button" href="/admin/produtos/novo">Cadastrar primeira peça</Link>
        </section>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Produto</th><th>Categoria</th><th>Status</th><th>Preço</th><th>Destaques</th><th></th></tr></thead>
            <tbody>
              {products.map((product) => {
                const category = Array.isArray(product.category) ? product.category[0] : product.category;
                return (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong><br /><small>{product.sku || `/${product.slug}`}</small></td>
                    <td>{category?.name ?? "—"}</td>
                    <td><span className="admin-status">{statusLabel[product.status] ?? product.status}</span></td>
                    <td>{product.price == null ? "Consultar" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}</td>
                    <td>{[product.featured && "Destaque", product.new_arrival && "Novidade"].filter(Boolean).join(" · ") || "—"}</td>
                    <td><Link href={`/admin/produtos/${product.id}`}>Editar</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
