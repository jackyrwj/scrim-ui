import * as fs from "node:fs";
import * as path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { components, getComponent, getRelated } from "@/lib/registry";
import { pageConfigs } from "@/showcase/registry";
import { PreviewFrame } from "@/components/component-page/preview-frame";
import { CopyButton } from "@/components/component-page/copy-button";
import { CodeBlock } from "@/components/component-page/code-block";
import { VariantCode } from "@/components/component-page/variant-code";
import { variantSnippet } from "@/lib/variant-source";

export function generateStaticParams() {
  return components.filter((c) => c.status === "published").map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const entry = getComponent(slug);
    if (!entry) return {};
    return {
      title: `${entry.name} UI — React + Tailwind Component`,
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

      {/* Live preview */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
            Live Preview
          </h2>
          <CopyButton code={source} label="Copy React" />
        </div>
        <PreviewFrame>{config.heroDemo}</PreviewFrame>
      </section>

      {/* Variants. Each one carries its own source, extracted from the demo
          that renders it — see lib/variant-source.ts. Copying the whole
          component file told you nothing about how to reach a given state. */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Variants</h2>
        <p className="mb-6 mt-1 text-sm text-(--muted-foreground)">
          Every variant is the same component under different props. Copy one to get the props
          that produce that state — the component itself is in{" "}
          <a href="#code" className="underline underline-offset-2 hover:text-(--foreground)">
            Code
          </a>{" "}
          below.
        </p>
        <div className="space-y-8">
          {config.variants.map((v) => {
            const snippet = variantSnippet(slug, v.id);
            return (
              <div key={v.id} id={`variant-${v.id}`} className="scroll-mt-20">
                <h3 className="text-sm font-medium">{v.title}</h3>
                <p className="mt-1 mb-3 text-sm text-(--muted-foreground)">{v.note}</p>
                <PreviewFrame>{v.demo}</PreviewFrame>
                {snippet && <VariantCode code={snippet} lang={`${v.id}.tsx`} />}
              </div>
            );
          })}
        </div>
      </section>

      {/* Playground */}
      {config.playground && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Playground</h2>
          <p className="mb-5 mt-1 text-sm text-(--muted-foreground)">
            Tweak the props and watch the component update live.
          </p>
          {config.playground}
        </section>
      )}

      {/* Code */}
      <section id="code" className="mt-14 scroll-mt-20">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Code</h2>
          <CopyButton code={source} label="Copy React" />
        </div>
        <p className="mb-3 text-sm text-(--muted-foreground)">
          Single-file React + Tailwind component. No dependencies — drop it into any project with
          Tailwind configured.
        </p>
        <CodeBlock code={source} lang={config.sourceFile} />
      </section>

      {/* Usage guidelines */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Usage Guidelines</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-(--muted-foreground)">
          {config.usage.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* Common mistakes */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Common UX Mistakes</h2>
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
