import Link from "next/link";

import {
  archiveProductAction,
  createProductAction,
  updateProductAction,
} from "@/app/admin/(protected)/produtos/actions";
import type { ProductStatus } from "@/types/commerce";

type CategoryOption = { id: string; name: string };

type EditableProduct = {
  id: string;
  category_id: string | null;
  compare_at_price: number | null;
  description: string | null;
  featured: boolean;
  name: string;
  new_arrival: boolean;
  price: number | null;
  short_description: string | null;
  sku: string | null;
  slug: string;
  sort_order: number;
  status: ProductStatus;
};

function moneyValue(value: number | null | undefined) {
  return value == null ? "" : Number(value).toFixed(2).replace(".", ",");
}

export function ProductForm({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: EditableProduct;
}) {
  const action = product ? updateProductAction : createProductAction;
  return (
    <form action={action} className="admin-product-form">
      <section className="admin-panel">
        <h2>Informações da peça</h2>
        {product ? <input type="hidden" name="id" value={product.id} /> : null}
        <div className="admin-fields">
          <label className="admin-field">
            Nome
            <input name="name" maxLength={160} defaultValue={product?.name} required />
          </label>
          <div className="admin-fields admin-fields-two">
            <label className="admin-field">
              Slug
              <input name="slug" maxLength={120} defaultValue={product?.slug} placeholder="gerado pelo nome" />
            </label>
            <label className="admin-field">
              SKU opcional
              <input name="sku" maxLength={80} defaultValue={product?.sku ?? ""} />
            </label>
          </div>
          <label className="admin-field">
            Descrição curta
            <textarea name="shortDescription" maxLength={600} rows={3} defaultValue={product?.short_description ?? ""} />
          </label>
          <label className="admin-field">
            Descrição completa
            <textarea name="description" maxLength={8000} rows={8} defaultValue={product?.description ?? ""} />
          </label>
        </div>
      </section>
      <aside>
        <section className="admin-panel">
          <h2>Publicação</h2>
          <div className="admin-fields">
            <label className="admin-field">
              Status
              <select name="status" defaultValue={product?.status ?? "draft"}>
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="sold_out">Indisponível</option>
                {product ? <option value="archived">Arquivado</option> : null}
              </select>
            </label>
            <label className="admin-field">
              Categoria
              <select name="categoryId" defaultValue={product?.category_id ?? ""}>
                <option value="">Sem categoria</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="admin-field">
              Ordem
              <input name="sortOrder" type="number" min="0" max="99999" defaultValue={product?.sort_order ?? 0} required />
            </label>
            <label className="admin-check">
              <input name="featured" type="checkbox" defaultChecked={product?.featured} />
              Produto em destaque
            </label>
            <label className="admin-check">
              <input name="newArrival" type="checkbox" defaultChecked={product?.new_arrival} />
              Marcar como novidade
            </label>
          </div>
        </section>
        <section className="admin-panel">
          <h2>Valores</h2>
          <div className="admin-fields">
            <label className="admin-field">
              Preço
              <input name="price" inputMode="decimal" defaultValue={moneyValue(product?.price)} placeholder="Deixe vazio para consultar" />
            </label>
            <label className="admin-field">
              Preço anterior
              <input name="compareAtPrice" inputMode="decimal" defaultValue={moneyValue(product?.compare_at_price)} />
            </label>
          </div>
          <p className="admin-help">Sem preço, a vitrine mostra “Consulte pelo WhatsApp”.</p>
        </section>
        <div className="admin-form-actions">
          <button type="submit">{product ? "Salvar alterações" : "Criar rascunho"}</button>
          <Link className="admin-button admin-button-secondary" href="/admin/produtos">Cancelar</Link>
        </div>
        {product && product.status !== "archived" ? (
          <div className="admin-form-actions">
            <button
              className="admin-button-secondary"
              formAction={archiveProductAction}
              type="submit"
            >
              Arquivar produto
            </button>
          </div>
        ) : null}
      </aside>
    </form>
  );
}
