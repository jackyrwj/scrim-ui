import * as fs from "node:fs";
import * as path from "node:path";
import { createElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { patterns, getPattern, getComponent } from "@/lib/registry";
import { patternIconFor } from "@/lib/icons";
import { patternConfigs } from "@/showcase/patterns/registry";
import { CopyButton } from "@/components/component-page/copy-button";
import { CodeBlock } from "@/components/component-page/code-block";

export function generateStaticParams() {
  return patterns.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const entry = getPattern(slug);
    if (!entry) return {};
    return { title: `${entry.name} — AI UI Pattern`, description: entry.description };
  });
}

function readPatternSource(slug: string, file: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), "src", "showcase", "patterns", slug, file), "utf8");
  } catch {
    return "// Source unavailable";
  }
}

export default async function PatternPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getPattern(slug);
  const config = patternConfigs[slug];
  if (!entry || !config) notFound();

  const source = readPatternSource(slug, config.sourceFile);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <nav className="mb-6 text-sm text-(--muted-foreground)">
        <Link href="/patterns" className="hover:text-(--foreground)">Patterns</Link>
        <span className="mx-2">/</span>
        <span className="text-(--foreground)">{entry.name}</span>
      </nav>
      <div className="flex items-center gap-2.5">
        {createElement(patternIconFor(slug), {
          size: 26,
          strokeWidth: 1.75,
          "aria-hidden": true,
          className: "shrink-0 text-(--primary)",
        })}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{entry.name}</h1>
      </div>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">{entry.description}</p>

      {/* The same three facts the card on /patterns promised, restated where
          the reader decides whether to copy: one file, this big, made of
          components they can read separately. */}
      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-(--muted-foreground)">
        <span className="rounded-md border border-(--border) px-1.5 py-0.5 font-mono text-[12px]">
          {config.sourceFile}
        </span>
        <span className="tabular-nums">{source.trimEnd().split("\n").length} lines</span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">
          {config.elements.filter((el) => el.componentSlug).length} components
        </span>
        <span aria-hidden>·</span>
        <span>React + Tailwind, no dependencies</span>
      </p>

      {/* Live preview */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
            Live Preview
          </h2>
          <CopyButton code={source} label="Copy Pattern" />
        </div>
        {/* No PreviewFrame here, unlike the component pages. Every pattern is a
            whole screen that already draws its own card — border, background,
            fixed height — so the frame added a second card around the first,
            and its `max-w-xl` stage squeezed a two-column settings screen into
            half its width. The pattern gets the page's full measure instead. */}
        {config.heroDemo}
      </section>

      {/* Built from */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Built from these components</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {config.elements.map((el) => {
            const comp = el.componentSlug ? getComponent(el.componentSlug) : undefined;
            const inner = (
              <div className="h-full rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60">
                <span className="font-medium">{el.label}</span>
                <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">
                  {comp?.description ?? "Core layout and shell of this pattern."}
                </p>
              </div>
            );
            return comp ? (
              <Link key={el.label} href={`/components/${comp.slug}`} className="block">
                {inner}
              </Link>
            ) : (
              <div key={el.label}>{inner}</div>
            );
          })}
        </div>
      </section>

      {/* Code */}
      <section className="mt-14">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Pattern code</h2>
          <CopyButton code={source} label="Copy Pattern" />
        </div>
        <p className="mb-3 text-sm text-(--muted-foreground)">
          This file composes the components above. Copy each component from its page, then this
          pattern file wires them together.
        </p>
        <CodeBlock code={source} lang={config.sourceFile} />
      </section>

      {/* Usage */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Usage Guidelines</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-(--muted-foreground)">
          {config.usage.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* Mistakes */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Common UX Mistakes</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-(--muted-foreground)">
          {config.mistakes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* More patterns */}
      <section className="mt-14 border-t border-(--border) pt-10">
        <h2 className="text-xl font-semibold tracking-tight">More Patterns</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {patterns
            .filter((p) => p.slug !== slug)
            .map((p) => (
              <Link
                key={p.slug}
                href={`/patterns/${p.slug}`}
                className="group rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60"
              >
                <span className="flex items-center gap-2">
                  {createElement(patternIconFor(p.slug), {
                    size: 15,
                    strokeWidth: 1.75,
                    "aria-hidden": true,
                    className:
                      "shrink-0 text-(--muted-foreground) transition-colors group-hover:text-(--primary)",
                  })}
                  <span className="font-medium group-hover:underline">{p.name}</span>
                </span>
                <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">{p.description}</p>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
