import type { MetadataRoute } from "next";
import { listCategories, listProductSitemap } from "@/lib/catalog/repository";
import { resolveStoreContext } from "@/lib/store/context";
import { siteUrl } from "./seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const context = await resolveStoreContext();
  const [categories, products] = await Promise.all([
    listCategories(context),
    listProductSitemap(context),
  ]);

  return [
    {
      url: siteUrl,
      priority: 1,
    },
    {
      url: `${siteUrl}/loja`,
      changeFrequency: "daily",
      priority: .9,
    },
    ...categories.map((category) => ({
      url: `${siteUrl}/loja/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: .7,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/produto/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: .8,
    })),
  ];
}
