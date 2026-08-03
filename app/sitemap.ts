import type { MetadataRoute } from "next";
import { siteUrl } from "./seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/instagram`,
      changeFrequency: "monthly",
      priority: .8,
    },
    {
      url: `${siteUrl}/privacidade`,
      changeFrequency: "yearly",
      priority: .3,
    },
  ];
}
