import { ProductForm } from "@/components/admin/product-form";
import { requireAdminRole } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID } from "@/types/commerce";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminRole(["admin", "editor"], "/admin/produtos/novo");
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name")
    .eq("store_id", HELENA_STORE_ID)
    .eq("active", true)
    .order("sort_order");

  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p>Novo cadastro</p><h1>Adicionar peça</h1></div></header>
      {params.erro ? <p className="admin-error" role="alert">Revise os campos. O produto ainda não foi criado.</p> : null}
      <ProductForm categories={categories ?? []} />
    </main>
  );
}
