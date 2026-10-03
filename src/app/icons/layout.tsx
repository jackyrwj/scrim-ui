import { categories } from "@/lib/registry";
import { iconGuide, iconSlug } from "@/lib/icon-guide";
import { CatalogLayout } from "@/components/site/catalog-layout";

const groups = categories.map((category) => ({
  slug: category.slug,
  name: category.name,
  href: `/icons#${category.slug}`,
  items: iconGuide.filter((entry) => entry.category === category.slug).map((entry) => ({
    slug: iconSlug(entry.concept),
    name: entry.concept,
  })),
})).filter((group) => group.items.length > 0);

export default function IconsLayout({ children }: { children: React.ReactNode }) {
  return <CatalogLayout href="/icons" label="Icons" groups={groups}>{children}</CatalogLayout>;
}
