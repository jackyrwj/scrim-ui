import { tools } from "@/lib/tools";
import { CatalogLayout } from "@/components/site/catalog-layout";

const groups = [{
  slug: "tools",
  name: "Design & development",
  items: tools.map(({ slug, name, status }) => ({ slug, name, status })),
}];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <CatalogLayout href="/tools" label="Tools" groups={groups}>{children}</CatalogLayout>;
}
