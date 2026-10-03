import * as fs from "node:fs";
import * as path from "node:path";
import Link from "next/link";
import { aicssComponents, aicssComponentPath, getAicssComponent } from "@/lib/aicss-catalog";
import { getCategory } from "@/lib/registry";
import { AicssPreview } from "@/components/component-page/aicss-preview";
import { PreviewAppearance } from "@/components/component-page/preview-appearance";
import { AicssSourceViewer, type AicssSourceGroup } from "@/components/component-page/aicss-source-viewer";

function sourceGroups(slug: string, sourceSlug: string): AicssSourceGroup[] {
  return (["react", "vue", "svelte"] as const).map((language) => {
    const directory = path.join(process.cwd(), "src", "aicss-source", language, sourceSlug);
    return {
      language,
      files: fs.readdirSync(directory).sort((a, b) => Number(a.endsWith(".css")) - Number(b.endsWith(".css"))).map((name) => ({
        name,
        code: fs.readFileSync(path.join(directory, name), "utf8"),
        url: `/components/${slug}/source/${language}/${name}`,
      })),
    };
  });
}

export function AicssDetail({ slug }: { slug: string }) {
  const component = getAicssComponent(slug);
  if (!component) return null;
  const related = aicssComponents.filter((entry) => entry.category === component.category && entry.slug !== slug);
  const category = getCategory(component.category);

  return (
    <div className="detail-page">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-(--muted-foreground)">
        <Link href="/components" className="hover:text-(--foreground)">Components</Link><span aria-hidden="true">/</span>
        <Link href={`/components#${component.category}`} className="hover:text-(--foreground)">{category?.name}</Link><span aria-hidden="true">/</span><span>{component.name}</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl">{slug === "aicss-message-actions" ? "Message Actions (AICSS)" : component.name}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-pretty text-(--muted-foreground)">{component.description}</p>
      <p className="mt-5 flex items-center gap-2 text-xs text-(--muted-foreground)">From <a href={`https://www.aicss.dev/components/${slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-(--foreground) hover:underline">AICSS ↗</a><span aria-hidden="true">·</span>React, Vue &amp; Svelte</p>

      <PreviewAppearance><AicssPreview slug={component.sourceSlug} /></PreviewAppearance>

      <section id="install" className="mt-10">
        <h2 className="text-base font-medium">Install</h2>
        <p className="mt-3 text-sm leading-7 text-(--muted-foreground)">Choose your framework below and copy the source into your project. For React, place the component and its CSS Module in the same folder, then import the component where you need it.</p>
      </section>

      <AicssSourceViewer groups={sourceGroups(slug, component.sourceSlug)} />

      {related.length > 0 && <section className="mt-14 border-t border-(--border) pt-8">
        <h2 className="text-base font-medium">Related components</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {related.map((entry) => <Link key={entry.slug} href={aicssComponentPath(entry.slug)} className="rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--stage)"><h3 className="text-sm font-medium">{entry.name} ↗</h3><p className="mt-2 text-xs leading-6 text-(--muted-foreground)">{entry.description}</p></Link>)}
        </div>
      </section>}
    </div>
  );
}
