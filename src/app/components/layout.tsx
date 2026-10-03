import { categories, components } from "@/lib/registry";
import { aicssComponents, aicssComponentPath } from "@/lib/aicss-catalog";
import { CatalogLayout } from "@/components/site/catalog-layout";
import { recreatedComponents } from "@/lib/recreated-catalog";

const groups = categories
  .map((category) => ({
    slug: category.slug,
    name: category.name,
    href: `/components#${category.slug}`,
    items: [
      ...components.filter((component) => component.category === category.slug).map((component) => ({
        slug: component.slug,
        name: component.name,
        status: component.status,
        pro: component.tier === "pro",
      })),
      ...aicssComponents.filter((component) => component.category === category.slug).map((component) => ({
        slug: component.slug,
        name: component.slug === "aicss-message-actions" ? "Message Actions (AICSS)" : component.name,
        href: aicssComponentPath(component.slug),
        status: "published" as const,
        pro: false,
      })),
      ...recreatedComponents.filter((component) => component.category === category.slug).map((component) => ({
        slug: component.slug,
        name: component.name,
        status: "published" as const,
        pro: false,
      })),
    ],
  }))
  .filter((group) => group.items.length > 0);

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CatalogLayout groups={groups} href="/components" label="Components">
      {children}
    </CatalogLayout>
  );
}
