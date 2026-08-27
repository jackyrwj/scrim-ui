import type { MetadataRoute } from "next";
import { components, categories, patterns } from "@/lib/registry";
import { inspirationEntries } from "@/lib/inspiration";
import { publishedTools } from "@/lib/tools";
import { publishedTemplates } from "@/lib/templates";
import { resources, resourceCategories, resourceSlug } from "@/lib/resources";
import { iconGuide, iconSlug } from "@/lib/icon-guide";
import { SITE_URL as BASE_URL } from "@/lib/site";
import contentDates from "@/lib/content-dates.json";

/**
 * The real date a page's source last changed, resolved from git history by
 * scripts/content-dates.mjs and committed as data.
 *
 * Stamping `new Date()` on all ~200 URLs told crawlers the whole site changed
 * on every deploy — a signal that is always true, and so worth nothing. The
 * build cannot ask git itself: Vercel clones shallowly and would report one
 * commit date for every file, which is the same lie wearing a different date.
 *
 * `now` remains the fallback, and is the honest answer for a page whose
 * source has not been committed yet.
 */
function lastModified(key: string, fallback: Date): Date {
  const iso = (contentDates as Record<string, string>)[key];
  return iso ? new Date(iso) : fallback;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: lastModified("src/app/page.tsx", now), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/components`, lastModified: lastModified("src/app/components/page.tsx", now), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/patterns`, lastModified: lastModified("src/app/patterns/page.tsx", now), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: lastModified("src/app/tools/page.tsx", now), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/icons`, lastModified: lastModified("src/app/icons/page.tsx", now), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/resources`, lastModified: lastModified("src/app/resources/page.tsx", now), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/inspiration`, lastModified: lastModified("src/app/inspiration/page.tsx", now), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/categories`, lastModified: lastModified("src/app/categories/page.tsx", now), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/templates`, lastModified: lastModified("src/app/templates/page.tsx", now), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/pro`, lastModified: lastModified("src/app/pro/page.tsx", now), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: lastModified("src/app/privacy/page.tsx", now), changeFrequency: "yearly", priority: 0.2 },
  ];

  const toolPages: MetadataRoute.Sitemap = publishedTools.map((t) => ({
    url: `${BASE_URL}/tools/${t.slug}`,
    lastModified: lastModified(`src/app/tools/${t.slug}`, now),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  /* Published only. A `planned` component has no page — components/[slug]
     calls notFound() for it — so listing one here would submit a URL to Google
     that is guaranteed to 404. The templates block below already filters this
     way via publishedTemplates; this one did not. */
  const componentPages: MetadataRoute.Sitemap = components
    .filter((c) => c.status === "published")
    .map((c) => ({
    url: `${BASE_URL}/components/${c.slug}`,
    lastModified: lastModified(`src/showcase/${c.slug}`, now),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    lastModified: lastModified("src/lib/registry.ts", now),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const patternPages: MetadataRoute.Sitemap = patterns.map((p) => ({
    url: `${BASE_URL}/patterns/${p.slug}`,
    lastModified: lastModified(`src/showcase/patterns/${p.slug}`, now),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const inspirationPages: MetadataRoute.Sitemap = inspirationEntries.map((e) => ({
    url: `${BASE_URL}/inspiration/${e.slug}`,
    lastModified: lastModified("src/lib/inspiration.ts", now),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const resourcePages: MetadataRoute.Sitemap = resources.map((r) => ({
    url: `${BASE_URL}/resources/${resourceSlug(r.name)}`,
    lastModified: lastModified("src/lib/resources.ts", now),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const iconPages: MetadataRoute.Sitemap = iconGuide.map((e) => ({
    url: `${BASE_URL}/icons/${iconSlug(e.concept)}`,
    lastModified: lastModified("src/lib/icon-guide.ts", now),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const resourceCategoryPages: MetadataRoute.Sitemap = resourceCategories.map((c) => ({
    url: `${BASE_URL}/resources/category/${c.slug}`,
    lastModified: lastModified("src/lib/resources.ts", now),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const templatePages: MetadataRoute.Sitemap = publishedTemplates.map((t) => ({
    url: `${BASE_URL}/templates/${t.slug}`,
    lastModified: lastModified(`templates/${t.dir}`, now),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...templatePages,
    ...iconPages,
    ...resourceCategoryPages,...staticPages, ...toolPages, ...componentPages, ...categoryPages, ...patternPages, ...inspirationPages, ...resourcePages];
}
