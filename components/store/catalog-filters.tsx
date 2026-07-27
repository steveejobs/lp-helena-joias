import Link from "next/link";

import type { Category } from "@/types/commerce";

export function CatalogFilters({
  categories,
  current,
  pricesEnabled,
}: {
  categories: Category[];
  current: Record<string, string | undefined>;
  pricesEnabled: boolean;
}) {
  return (
    <form className="catalog-filters" action="/loja" method="get">
      <label className="catalog-search">
        <span>Buscar uma peça</span>
        <input
          type="search"
          name="busca"
          defaultValue={current.busca}
          maxLength={80}
          placeholder="Nome, categoria ou código"
        />
        <button type="submit" aria-label="Buscar">↗</button>
      </label>
      <details>
        <summary>Refinar seleção <span>+</span></summary>
        <div className="catalog-filter-fields">
          <label>
            Categoria
            <select name="categoria" defaultValue={current.categoria ?? ""}>
              <option value="">Todas</option>
              {categories.map((category) => (
                <option value={category.slug} key={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label>
            Disponibilidade
            <select name="disponibilidade" defaultValue={current.disponibilidade ?? ""}>
              <option value="">Todas</option>
              <option value="available">Disponíveis</option>
              <option value="sold_out">Indisponíveis</option>
            </select>
          </label>
          <label>
            Curadoria
            <select name="curadoria" defaultValue={current.curadoria ?? ""}>
              <option value="">Todas</option>
              <option value="destaque">Destaques</option>
              <option value="novidade">Novidades</option>
            </select>
          </label>
          {pricesEnabled ? (
            <div className="price-filter">
              <label>Preço mínimo<input type="number" name="preco_min" min="0" step="1" defaultValue={current.preco_min} /></label>
              <label>Preço máximo<input type="number" name="preco_max" min="0" step="1" defaultValue={current.preco_max} /></label>
            </div>
          ) : null}
          <div className="catalog-filter-actions">
            <Link href="/loja">Limpar</Link>
            <button type="submit">Aplicar filtros</button>
          </div>
        </div>
      </details>
    </form>
  );
}
