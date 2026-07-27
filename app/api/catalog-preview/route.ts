import { NextResponse } from "next/server";

import { getStore, listCategories, listProducts } from "@/lib/catalog/repository";
import { resolveStoreContext } from "@/lib/store/context";

export const revalidate = 300;

export async function GET() {
  const context = await resolveStoreContext();
  const [store, categories, featured] = await Promise.all([
    getStore(context),
    listCategories(context),
    listProducts(context, { featured: true }, 1, 4),
  ]);
  const products = featured.length
    ? featured
    : await listProducts(context, {}, 1, 4);
  return NextResponse.json(
    {
      categories: categories.map(({ id, iconKey, name, slug }) => ({ id, iconKey, name, slug })),
      products: products.map((product) => ({
        categoryId: product.categoryId,
        categoryName: product.category?.name ?? "Helena Joias",
        image: product.images.find((image) => image.isPrimary) ?? product.images[0] ?? null,
        name: product.name,
        price: store.showPrices ? product.price : null,
        slug: product.slug,
      })),
      store: { currency: store.currency, locale: store.locale },
    },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
