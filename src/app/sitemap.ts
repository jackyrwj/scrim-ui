import type { MetadataRoute } from "next";
import { components, categories, patterns } from "@/lib/registry";
import { inspirationEntries } from "@/lib/inspiration";
import { publishedTools } from "@/lib/tools";
import { resources, resourceCategories, resourceSlug } from "@/lib/resources";
import { iconGuide, iconSlug } from "@/lib/icon-guide";
import { SITE_URL as BASE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/components`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/patterns`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/icons`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/inspiration`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const toolPages: MetadataRoute.Sitemap = publishedTools.map((t) => ({
    url: `${BASE_URL}/tools/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const componentPages: MetadataRoute.Sitemap = components.map((c) => ({
    url: `${BASE_URL}/components/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const patternPages: MetadataRoute.Sitemap = patterns.map((p) => ({
    url: `${BASE_URL}/patterns/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const inspirationPages: MetadataRoute.Sitemap = inspirationEntries.map((e) => ({
    url: `${BASE_URL}/inspiration/${e.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const resourcePages: MetadataRoute.Sitemap = resources.map((r) => ({
    url: `${BASE_URL}/resources/${resourceSlug(r.name)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const iconPages: MetadataRoute.Sitemap = iconGuide.map((e) => ({
    url: `${BASE_URL}/icons/${iconSlug(e.concept)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const resourceCategoryPages: MetadataRoute.Sitemap = resourceCategories.map((c) => ({
    url: `${BASE_URL}/resources/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...iconPages,
    ...resourceCategoryPages,...staticPages, ...toolPages, ...componentPages, ...categoryPages, ...patternPages, ...inspirationPages, ...resourcePages];
}
