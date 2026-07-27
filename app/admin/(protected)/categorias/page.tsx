import { CategoryIcon } from "@/components/store/category-icons";
import { createCategoryAction, updateCategoryAction } from "./actions";
import { requireAdminRole } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID, type CategoryIconKey } from "@/types/commerce";

const iconOptions: Array<[CategoryIconKey, string]> = [
  ["necklaces", "Colares"],
  ["earrings", "Brincos"],
  ["bracelets", "Pulseiras"],
  ["rings", "Anéis"],
  ["sets", "Conjuntos"],
];

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminRole(["admin", "editor"], "/admin/categorias");
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,icon_key,sort_order,active")
    .eq("store_id", HELENA_STORE_ID)
    .order("sort_order")
    .order("name")
    .limit(100);
  if (error) throw new Error("Não foi possível carregar as categorias.");

  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <div><p>Catálogo</p><h1>Categorias</h1></div>
      </header>
      {params.ok ? <p className="admin-success" role="status">Categoria atualizada com sucesso.</p> : null}
      {params.erro ? <p className="admin-error" role="alert">Não foi possível salvar. Revise os campos e tente novamente.</p> : null}
      <details className="admin-create-panel">
        <summary>+ Nova categoria</summary>
        <form action={createCategoryAction} className="admin-form-grid">
          <label>Nome<input name="name" maxLength={120} required /></label>
          <label>Slug<input name="slug" maxLength={120} placeholder="gerado pelo nome" /></label>
          <label>Ícone<select name="iconKey" required>{iconOptions.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Ordem<input name="sortOrder" type="number" min="0" max="999" defaultValue="5" required /></label>
          <label className="admin-full-field">Descrição<textarea name="description" maxLength={500} rows={3} /></label>
          <label className="admin-check"><input type="checkbox" name="active" defaultChecked /> Ativa</label>
          <button type="submit">Criar categoria</button>
        </form>
      </details>
      <section className="admin-category-list">
        {categories.map((category) => (
          <details key={category.id}>
            <summary>
              <CategoryIcon iconKey={(category.icon_key ?? "sets") as CategoryIconKey} />
              <span><strong>{category.name}</strong><small>/{category.slug}</small></span>
              <i>{category.active ? "Ativa" : "Inativa"}</i>
            </summary>
            <form action={updateCategoryAction} className="admin-form-grid">
              <input type="hidden" name="id" value={category.id} />
              <label>Nome<input name="name" defaultValue={category.name} maxLength={120} required /></label>
              <label>Slug<input name="slug" defaultValue={category.slug} maxLength={120} required /></label>
              <label>Ícone<select name="iconKey" defaultValue={category.icon_key ?? "sets"}>{iconOptions.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label>
              <label>Ordem<input name="sortOrder" type="number" min="0" max="999" defaultValue={category.sort_order} required /></label>
              <label className="admin-full-field">Descrição<textarea name="description" maxLength={500} rows={3} defaultValue={category.description ?? ""} /></label>
              <label className="admin-check"><input type="checkbox" name="active" defaultChecked={category.active} /> Ativa</label>
              <button type="submit">Salvar alterações</button>
            </form>
          </details>
        ))}
      </section>
    </main>
  );
}

