import { templates } from "@/lib/templates";
import { CatalogLayout } from "@/components/site/catalog-layout";

const groups = [{
  slug: "templates",
  name: "App templates",
  items: templates.map(({ slug, name, status, tier }) => ({ slug, name, status, pro: tier === "pro" })),
}];

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <CatalogLayout href="/templates" label="Templates" groups={groups}>{children}</CatalogLayout>;
}
