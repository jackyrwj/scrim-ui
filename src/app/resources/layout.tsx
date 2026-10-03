import { resourceCategories, resources, resourceSlug } from "@/lib/resources";
import { CatalogLayout } from "@/components/site/catalog-layout";

const groups = resourceCategories.map((category) => ({
  slug: category.slug,
  name: category.name,
  href: `/resources/category/${category.slug}`,
  items: resources.filter((entry) => entry.category === category.slug).map((entry) => ({
    slug: resourceSlug(entry.name),
    name: entry.name,
  })),
}));

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <CatalogLayout href="/resources" label="Resources" groups={groups}>{children}</CatalogLayout>;
}
