import { patterns } from "@/lib/registry";
import { CatalogLayout } from "@/components/site/catalog-layout";

const groups = [{
  slug: "patterns",
  name: "Interface patterns",
  items: patterns.map(({ slug, name, tier }) => ({ slug, name, pro: tier === "pro" })),
}];

export default function PatternsLayout({ children }: { children: React.ReactNode }) {
  return <CatalogLayout href="/patterns" label="Patterns" groups={groups}>{children}</CatalogLayout>;
}
