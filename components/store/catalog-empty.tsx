import Link from "next/link";
import { HomeWhatsAppButton } from "@/components/home/whatsapp-button";

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
          : "Enquanto isso, fale com a Helena para conhecer as peças disponíveis."}
      </span>
      <div>
        {filtered ? <Link href="/loja">Limpar filtros</Link> : null}
        <HomeWhatsAppButton className="catalog-empty-whatsapp" origin={filtered ? "catálogo sem resultados" : "catálogo vazio"} />
      </div>
    </section>
  );
}
