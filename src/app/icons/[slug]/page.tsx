import { createElement } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { iconGuide, iconSlug, getIconEntry, relatedIcons } from "@/lib/icon-guide";
import { getCategory, components } from "@/lib/registry";
import { categoryIconFor } from "@/lib/icons";
import { IconEditor } from "@/components/icons/icon-editor";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return iconGuide.map((e) => ({ slug: iconSlug(e.concept) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getIconEntry(slug);
  if (!entry) return { title: "Icon" };
  const name = entry.icon.displayName ?? "Icon";
  return {
    title: `${entry.concept} icon — ${name}`,
    description: `${entry.meaning}. The Lucide icon we use for "${entry.concept}" in AI interfaces — set size, stroke and colour, then copy as React, Vue, Svelte, SVG or PNG.`,
  };
}

export default async function IconPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getIconEntry(slug);
  if (!entry) notFound();

  const name = entry.icon.displayName ?? "Icon";
  const category = getCategory(entry.category);
  const related = relatedIcons(entry);
  const used = entry.components
    .map((s) => components.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-(--muted-foreground)">
        <Link href="/icons" className="transition-colors hover:text-(--foreground)">
          Icons
        </Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden />
        {category && (
          <>
            <span className="flex items-center gap-1.5">
              {createElement(categoryIconFor(entry.category), {
                size: 14,
                strokeWidth: 1.75,
                "aria-hidden": true,
              })}
              {category.name}
            </span>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          </>
        )}
        <span className="text-(--foreground)">{entry.concept}</span>
      </nav>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{entry.concept}</h1>
          {/* Full foreground, not muted: this is the name you copy. */}
          <code className="rounded-md bg-(--muted) px-2 py-1 font-mono text-xs text-(--foreground)">
            {name}
          </code>
        </div>
        <p className="mt-3 text-lg text-(--muted-foreground)">{entry.meaning}</p>
      </header>

      <div className="mt-8">
        <IconEditor
          name={name}
          concept={entry.concept}
          meaning={entry.meaning}
          docsUrl={`${SITE_URL}/icons/${slug}`}
          usedBy={used.map((c) => c.name)}
        >
          {/* Rendered here, on the server. The editor changes its attributes
              rather than re-rendering it — see the note in icon-editor.tsx. */}
          {createElement(entry.icon, { size: 48, strokeWidth: 2, "aria-hidden": true })}
        </IconEditor>
      </div>

      {/* Legibility check at real UI sizes, at Lucide's default stroke — the
          failure mode this catches is a glyph that reads at 48 dissolving at
          16. Server-rendered and static on purpose: the editor above is for
          tuning, this strip is for judging. */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
          At every size
        </h2>
        <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4 rounded-xl border border-(--border) bg-(--muted)/30 px-6 py-5">
          {[12, 16, 20, 24, 32, 48].map((s) => (
            <span key={s} className="flex flex-col items-center gap-1.5">
              {createElement(entry.icon, { size: s, strokeWidth: 2, "aria-hidden": true })}
              <span className="text-[10px] tabular-nums text-(--muted-foreground)">{s}px</span>
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-(--muted-foreground)">
          Stroke 2 at 16px and below reads heavy next to body text — drop to 1.5 with the slider
          above.
        </p>
      </section>

      {used.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
            Components that use it
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {used.map((c) => (
              <Link
                key={c.slug}
                href={`/components/${c.slug}`}
                className="rounded-lg border border-(--border) px-3 py-1.5 text-sm transition-colors hover:border-(--primary)/40 hover:bg-(--primary-muted)"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
            Others in {category?.name ?? "this category"}
          </h2>
          {/* The neighbours matter: an icon is only right relative to the ones
              it sits beside, and this is where a wrong pairing shows up. */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((e) => (
              <Link
                key={e.concept}
                href={`/icons/${iconSlug(e.concept)}`}
                className="group flex items-center gap-2.5 rounded-lg border border-(--border) px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-(--primary)/40"
              >
                <span className="text-(--primary) transition-transform duration-300 group-hover:scale-110">
                  {createElement(e.icon, { size: 18, strokeWidth: 2, "aria-hidden": true })}
                </span>
                <span className="truncate text-sm group-hover:underline">{e.concept}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
