import Link from "next/link";

import { CategoryIcon } from "@/components/store/category-icons";
import { OpeningPrototypeButterfly } from "@/components/store/opening-prototype-butterfly";
import type { CategoryIconKey } from "@/types/commerce";

import styles from "./prototype.module.css";

const categories: Array<{ icon: CategoryIconKey; label: string; slug: string }> = [
  { icon: "necklaces", label: "Colares", slug: "colares" },
  { icon: "earrings", label: "Brincos", slug: "brincos" },
  { icon: "bracelets", label: "Pulseiras", slug: "pulseiras" },
  { icon: "rings", label: "Anéis", slug: "aneis" },
  { icon: "sets", label: "Conjuntos", slug: "conjuntos" },
];

export default function OpeningPrototypePage() {
  return (
    <main className={styles.prototype}>
      <header className={styles.header}>
        <span>Helena Joias</span>
        <small>Estudo de abertura</small>
      </header>

      <section className={styles.opening} aria-labelledby="prototype-title">
        <div className={styles.copy}>
          <p>Loja online</p>
          <h1 id="prototype-title">
            Peças para <em>brilhar à sua maneira.</em>
          </h1>
          <div className={styles.support}>
            <p>Escolha com calma e fale com a Helena para confirmar disponibilidade.</p>
            <Link href="#prototype-categories">
              Ver a seleção <span aria-hidden="true">↓</span>
            </Link>
          </div>
        </div>

        <div className={styles.flight} aria-hidden="true">
          <OpeningPrototypeButterfly className={styles.butterfly} />
        </div>
      </section>

      <section className={styles.categories} id="prototype-categories" aria-labelledby="prototype-categories-title">
        <header>
          <p>Explore por categoria</p>
          <h2 id="prototype-categories-title">Comece por uma forma.</h2>
        </header>
        <nav aria-label="Categorias do protótipo">
          {categories.map((category) => (
            <Link href={`/loja/${category.slug}`} key={category.slug}>
              <CategoryIcon iconKey={category.icon} label="" />
              <span>{category.label}</span>
              <i aria-hidden="true">↗</i>
            </Link>
          ))}
        </nav>
      </section>

      <section className={styles.collectionHint} aria-hidden="true">
        <span>Coleção completa</span>
        <i />
      </section>
    </main>
  );
}
