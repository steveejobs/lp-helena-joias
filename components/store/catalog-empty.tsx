import Link from "next/link";

export function CatalogEmpty({ filtered = false }: { filtered?: boolean }) {
  return (
    <section className="catalog-empty">
      <div className="empty-jewel" aria-hidden="true"><i /><i /><i /></div>
      <p>{filtered ? "Nenhuma peça corresponde à seleção" : "A curadoria online está sendo preparada"}</p>
      <h2>
        {filtered ? "Que tal explorar outro brilho?" : "As primeiras peças chegam em breve."}
      </h2>
      <span>
        {filtered
          ? "Ajuste os filtros ou volte para a coleção completa."
          : "Enquanto isso, conheça a Helena e acompanhe as novidades pelo Instagram."}
      </span>
      <div>
        {filtered ? <Link href="/loja">Limpar filtros</Link> : null}
        <Link href="/instagram">Acompanhar a Helena <b aria-hidden="true">↗</b></Link>
      </div>
    </section>
  );
}

