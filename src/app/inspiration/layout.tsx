import { inspirationEntries } from "@/lib/inspiration";
import { CatalogLayout } from "@/components/site/catalog-layout";

const groups = [
  { slug: "case-study", name: "Product studies" },
  { slug: "guide", name: "Design guides" },
].map((group) => ({
  ...group,
  href: `/inspiration#${group.slug}`,
  items: inspirationEntries.filter((entry) => entry.kind === group.slug).map((entry) => ({
    slug: entry.slug,
    name: entry.product ?? entry.title,
  })),
}));

export default function InspirationLayout({ children }: { children: React.ReactNode }) {
  return <CatalogLayout href="/inspiration" label="Inspiration" groups={groups}>{children}</CatalogLayout>;
}
