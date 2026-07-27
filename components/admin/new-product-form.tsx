import Link from "next/link";

import { createProductAction } from "@/app/admin/(protected)/produtos/actions";

type CategoryOption = { id: string; name: string };

export function NewProductForm({ categories }: { categories: CategoryOption[] }) {
  return (
    <form action={createProductAction} className="admin-guided-form">
      <ol className="admin-stepper" aria-label="Etapas do cadastro">
        <li aria-current="step"><span>1</span><div><strong>Informações</strong><small>Agora</small></div></li>
        <li><span>2</span><div><strong>Fotos</strong><small>Próxima etapa</small></div></li>
        <li><span>3</span><div><strong>Publicar</strong><small>Quando estiver pronto</small></div></li>
      </ol>
      <section className="admin-panel admin-guided-card">
        <header>
          <p className="admin-section-kicker">Passo 1 de 3</p>
          <h2>Conte o essencial sobre a peça</h2>
          <p>Não precisa preencher tudo de uma vez. O produto será salvo como rascunho e poderá ser completado depois.</p>
        </header>
        <div className="admin-fields">
          <label className="admin-field admin-emphasis-field">
            Qual é o nome da peça?
            <input name="name" maxLength={160} placeholder="Ex.: Colar Aurora" autoFocus required />
            <small>Use o nome pelo qual você reconhece a peça.</small>
          </label>
          <label className="admin-field">
            Em qual categoria ela aparece?
            <select name="categoryId" defaultValue="" required>
              <option value="" disabled>Escolha uma categoria</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="admin-field">
            Uma descrição curta
            <textarea name="shortDescription" maxLength={600} rows={3} placeholder="Descreva o que torna esta peça especial." />
          </label>
          <label className="admin-field">
            Preço, se já estiver definido
            <span className="admin-money-input"><b>R$</b><input name="price" inputMode="decimal" placeholder="189,00" /></span>
            <small>Se deixar vazio, a loja mostrará “Consulte pelo WhatsApp”.</small>
          </label>
          <details className="admin-advanced-fields">
            <summary>Tenho mais informações para adicionar</summary>
            <div>
              <label className="admin-field">Descrição completa<textarea name="description" maxLength={8000} rows={6} /></label>
              <label className="admin-field">Código/SKU opcional<input name="sku" maxLength={80} /></label>
              <label className="admin-check"><input name="newArrival" type="checkbox" /> Marcar como novidade</label>
            </div>
          </details>
        </div>
        <input type="hidden" name="slug" value="" />
        <input type="hidden" name="sortOrder" value="0" />
        <input type="hidden" name="status" value="draft" />
        <footer>
          <Link className="admin-button admin-button-secondary" href="/admin/produtos">Cancelar</Link>
          <button type="submit">Salvar e adicionar fotos <span aria-hidden="true">→</span></button>
        </footer>
      </section>
    </form>
  );
}
