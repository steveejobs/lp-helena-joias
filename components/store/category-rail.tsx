import Link from "next/link";

import type { Category } from "@/types/commerce";
import { CategoryInteraction } from "@/components/analytics/category-interaction";

import { CategoryIcon } from "./category-icons";

export function CategoryRail({
  categories,
  currentSlug,
}: {
  categories: Category[];
  currentSlug?: string;
}) {
  return (
    <div className="category-rail" id="categorias">
      {categories.map((category, index) => (
        <Link
          className={currentSlug === category.slug ? "is-current" : undefined}
          href={`/loja/${category.slug}`}
          key={category.id}
          style={{ "--category-index": index } as React.CSSProperties}
        >
          <CategoryInteraction categoryId={category.id} />
          <span className="category-icon-frame">
            <CategoryIcon iconKey={category.iconKey} label={`Categoria ${category.name}`} />
          </span>
          <span className="category-rail-copy">
            <b>{String(index + 1).padStart(2, "0")}</b>
            <strong>{category.name}</strong>
            <i aria-hidden="true">↗</i>
          </span>
        </Link>
      ))}
    </div>
  );
}
