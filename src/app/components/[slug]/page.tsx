import * as fs from "node:fs";
import * as path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { components, getComponent, getRelated } from "@/lib/registry";
import { pageConfigs } from "@/showcase/registry";
import { CodeBlock } from "@/components/component-page/code-block";
import { ComponentExplorer } from "@/components/component-page/explorer";
import { JsonLd } from "@/components/site/json-ld";
import { componentSchema } from "@/lib/structured-data";

export function generateStaticParams() {
  return components.filter((c) => c.status === "published").map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const entry = getComponent(slug);
    if (!entry) return {};
    return {
      /* searchTitle leads with the phrase a developer actually types; the
         generic pattern is the fallback for entries that have not been given
         one. The old pattern spent 26 of ~48 usable characters on
         "React + Tailwind Component" — boilerplate repeated on all 29 pages,
         which crowded out the words that distinguish them. */
      title: entry.searchTitle ?? `${entry.name} UI — React + Tailwind Component`,
      description: entry.description,
    };
  });
}

function readShowcaseSource(slug: string, file: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), "src", "showcase", slug, file), "utf8");
  } catch {
    return "// Source unavailable";
  }
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getComponent(slug);
  const config = pageConfigs[slug];
  if (!entry || entry.status !== "published" || !config) notFound();

  const source = readShowcaseSource(slug, config.sourceFile);
  const related = getRelated(entry);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <JsonLd data={componentSchema(entry)} />

      {/* Header */}
      <nav className="mb-6 text-sm text-(--muted-foreground)">
        <Link href="/components" className="hover:text-(--foreground)">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-(--foreground)">{entry.name}</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{entry.name} UI</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">{entry.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {entry.tags.map((t) => (
          <span key={t} className="rounded-full border border-(--border) px-2.5 py-0.5 text-xs text-(--muted-foreground)">
            {t}
          </span>
        ))}
      </div>

      {/* Presets, controls, preview and generated code in one surface. This
          replaced a hero preview, a list of static variants each with its own
          collapsed snippet, and — for three components out of thirty — a
          separate hand-written playground. See lib/component-controls.ts. */}
      <section className="mt-10">
        <ComponentExplorer schema={config.explorer.schema} render={config.explorer.render} />
      </section>

      {/* The component file itself, as opposed to the call site the Explorer
          shows. Both are code; naming them both "Code" made the second look
          like a repeat of the first. */}
      <section id="source" className="mt-14 scroll-mt-20">
        <h2 className="text-xl font-semibold tracking-tight">Component source</h2>
        <p className="mb-3 mt-1 text-sm text-(--muted-foreground)">
          Single-file React + Tailwind component. No dependencies — drop it into any project with
          Tailwind configured.
        </p>
        <CodeBlock code={source} filename={config.sourceFile} />
      </section>

      {/* Usage guidelines */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">When to use it</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-(--muted-foreground)">
          {config.usage.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* Common mistakes */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">What breaks in production</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-(--muted-foreground)">
          {config.mistakes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* Related */}
      <section className="mt-14 border-t border-(--border) pt-10">
        <h2 className="text-xl font-semibold tracking-tight">Related Components</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={r.status === "published" ? `/components/${r.slug}` : "/components"}
              className="group rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium group-hover:underline">{r.name}</span>
                {r.status === "planned" && (
                  <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                    Soon
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">{r.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
