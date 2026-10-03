import * as fs from "node:fs";
import * as path from "node:path";
import Link from "next/link";
import { getCategory } from "@/lib/registry";
import { getRecreatedComponent } from "@/lib/recreated-catalog";
import { PreviewAppearance } from "@/components/component-page/preview-appearance";
import { RecreatedPreview } from "@/components/component-page/recreated-preview";
import { CodeBlock } from "@/components/component-page/code-block";

export function RecreatedDetail({ slug }: { slug: string }) {
  const component = getRecreatedComponent(slug);
  if (!component) return null;
  const category = getCategory(component.category);
  const source = fs.readFileSync(path.join(process.cwd(), "src", "recreated-components", component.sourceFile), "utf8");
  return <div className="detail-page">
    <nav aria-label="Breadcrumb" className="mb-6 text-xs text-(--muted-foreground)"><Link href="/components" className="hover:text-(--foreground)">Components</Link><span className="mx-2">/</span><Link href={`/components#${component.category}`} className="hover:text-(--foreground)">{category?.name}</Link></nav>
    <h1 className="text-3xl font-medium sm:text-4xl">{component.name}</h1>
    <p className="mt-4 max-w-2xl text-base leading-7 text-(--muted-foreground)">{component.description}</p>
    <p className="mt-4 max-w-2xl text-xs leading-6 text-(--muted-foreground)">Independent Scrim UI implementation of this interface pattern. This is not the original AICSS Pro source. React + Tailwind.</p>
    <PreviewAppearance><RecreatedPreview slug={slug} /></PreviewAppearance>
    <section id="source" className="mt-10 scroll-mt-24"><h2 className="mb-4 text-base font-medium">Component source</h2><CodeBlock code={source} filename={component.sourceFile} /></section>
  </div>;
}
