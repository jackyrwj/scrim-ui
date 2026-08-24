import * as fs from "node:fs";
import * as path from "node:path";
import { createElement } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { patterns, components, getComponent } from "@/lib/registry";
import { patternConfigs } from "@/showcase/patterns/registry";
import { patternIconFor } from "@/lib/icons";
import { PatternPreview } from "@/components/site/pattern-preview";

export const metadata: Metadata = {
  title: "Patterns",
  description:
    "Whole AI screens you can copy — chat, research, coding agent, voice and preferences — each assembled from the components on this site.",
};

/**
 * How many lines the pattern's source file is.
 *
 * The card claims the pattern is one file you copy, so it says how big that
 * file is. Read at build time from the same file /patterns/[slug] serves and
 * the Copy button hands over, so the number cannot drift from what a reader
 * actually gets.
 */
function sourceLines(slug: string, file: string): number | null {
  try {
    return fs
      .readFileSync(path.join(process.cwd(), "src", "showcase", "patterns", slug, file), "utf8")
      .trimEnd()
      .split("\n").length;
  } catch {
    return null;
  }
}

function PatternCard({ slug, featured }: { slug: string; featured: boolean }) {
  const entry = patterns.find((p) => p.slug === slug)!;
  const config = patternConfigs[slug];
  const parts = config?.elements ?? [];
  const named = parts.map((el) => (el.componentSlug ? getComponent(el.componentSlug) : null));
  const componentCount = named.filter(Boolean).length;
  const lines = config ? sourceLines(slug, config.sourceFile) : null;

  return (
    <Link
      href={`/patterns/${slug}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-(--border) bg-(--card) transition-all hover:-translate-y-0.5 hover:border-(--primary)/30 ${
        featured ? "sm:col-span-2 lg:col-span-3" : "lg:col-span-2"
      }`}
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <PatternPreview slug={slug} size={featured ? "lg" : "md"} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          {createElement(patternIconFor(slug), {
            size: 15,
            strokeWidth: 1.75,
            "aria-hidden": true,
            className:
              "shrink-0 text-(--muted-foreground) transition-colors group-hover:text-(--primary)",
          })}
          <span className="truncate text-sm font-medium group-hover:underline">{entry.name}</span>
          {lines !== null && (
            <span className="ml-auto shrink-0 rounded-full bg-(--muted) px-2 py-0.5 text-[11px] tabular-nums text-(--muted-foreground)">
              {lines} lines
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[13px] leading-5 text-(--muted-foreground)">
          {entry.description}
        </p>

        {/* What it is made of. Named in full rather than counted, because the
            components are the reason to trust the pattern: every part of it is
            documented on its own page. */}
        <div className="mt-auto pt-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">
            {componentCount} components
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {named.map((comp, i) =>
              comp ? (
                <span
                  key={comp.slug}
                  className="rounded-md border border-(--border) px-1.5 py-0.5 text-[11px] text-(--muted-foreground)"
                >
                  {comp.name}
                </span>
              ) : (
                <span
                  key={`shell-${i}`}
                  className="rounded-md border border-dashed border-(--border) px-1.5 py-0.5 text-[11px] text-(--muted-foreground)"
                >
                  {parts[i].label}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PatternsPage() {
  const publishedComponents = components.filter((c) => c.status === "published").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {patterns.length} AI Interface Patterns
        </h1>
        <p className="mt-3 text-lg text-(--muted-foreground)">
          A pattern is a whole screen, not one control — the chat, the research run, the agent
          loop. Each one is a single React + Tailwind file you copy, assembled from components
          documented individually on this site.
        </p>
      </header>

      {/* The distinction the page lives or dies on. Readers arrive from
          /components and need to know in one line whether this is more of the
          same at a bigger size, or something else. */}
      <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-xl border border-(--border) bg-(--muted)/40 p-4 text-[13px] leading-5 sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-(--muted-foreground)">
          <span className="font-medium text-(--foreground)">Component</span> — one control, like
          the composer or a tool call.{" "}
          <Link href="/components" className="text-(--primary) hover:underline">
            Browse {publishedComponents} &rarr;
          </Link>
        </p>
        <span aria-hidden className="hidden w-px self-stretch bg-(--border) sm:block" />
        <p className="flex-1 text-(--muted-foreground)">
          <span className="font-medium text-(--foreground)">Pattern</span> — the screen those
          controls live in, wired together and ready to remix.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {patterns.map((p, i) => (
          <PatternCard key={p.slug} slug={p.slug} featured={i < 2} />
        ))}
      </div>
    </div>
  );
}
