import type { Metadata } from "next";
import { components, categories } from "@/lib/registry";
import { aicssComponents } from "@/lib/aicss-catalog";
import { recreatedComponents } from "@/lib/recreated-catalog";
import { GalleryCard } from "@/components/site/gallery-card";
import { AdsterraBanner } from "@/components/ads/adsterra-banner";
import { CatalogHeader } from "@/components/site/catalog-header";

export const metadata: Metadata = {
  title: "Copy-ready AI UI Components",
  description: "Preview and copy components for prompts, streaming, tool calls, citations, agent states and more.",
};

export default function ComponentsPage() {
  const published = components.filter((component) => component.status === "published");
  return (
    <div className="catalog-page">
      <CatalogHeader eyebrow="The component library" title="Components">Small, considered building blocks for AI products. Explore {published.length + aicssComponents.length + recreatedComponents.length} components, try the previews, and copy the source into your project.</CatalogHeader>
      <nav aria-label="Jump to category" className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => <a key={category.slug} href={`#${category.slug}`} className="rounded-full bg-(--primary-muted) px-3 py-2 text-xs text-(--muted-foreground) transition-colors hover:text-(--foreground)">{category.name}</a>)}
      </nav>
      <AdsterraBanner />
      <div className="mt-12 space-y-14">
        {categories.map((category) => {
          const items = components.filter((component) => component.category === category.slug);
          const aicssItems = aicssComponents.filter((component) => component.category === category.slug);
          const recreatedItems = recreatedComponents.filter((component) => component.category === category.slug);
          if (!items.length && !aicssItems.length && !recreatedItems.length) return null;
          return (
            <section key={category.slug} id={category.slug} className="scroll-mt-24">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-base font-medium tracking-[-0.01em]"><a href={`/categories/${category.slug}`} className="hover:underline">{category.name}</a></h2>
                <span className="text-xs tabular-nums text-(--muted-foreground)">{items.length + aicssItems.length + recreatedItems.length} components</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((component) => <GalleryCard key={component.slug} {...component} variants={component.variants.length} published={component.status === "published"} pro={component.tier === "pro"} />)}
                {aicssItems.map((component) => <GalleryCard key={component.slug} {...component} name={component.slug === "aicss-message-actions" ? "Message Actions (AICSS)" : component.name} aicss />)}
                {recreatedItems.map((component) => <GalleryCard key={component.slug} {...component} recreated />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
