import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  resources,
  resourceCategories,
  getResourceCategory,
  resourceSlug,
} from "@/lib/resources";
import { previewPath } from "@/lib/previews";
import { ResourceCard } from "@/components/resources/resource-card";

/**
 * A real URL per resource category.
 *
 * /resources already filters by category, but it does it with a query
 * parameter on a client component — and a query parameter is not a page.
 * Search engines treat `?category=assets` as the same document as
 * `/resources`, so five genuinely distinct collections were invisible.
 *
 * These are the indexable version: own title, own description, own OG card.
 * The browser at /resources keeps its instant client-side filtering, because
 * that is the better experience once someone is already there — this is for
 * the reader who has not arrived yet.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return resourceCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getResourceCategory(slug);
  if (!category) return { title: "Resources" };
  const count = resources.filter((r) => r.category === slug).length;
  return {
    title: `${count} ${category.name} for AI interfaces`,
    description: `${category.description} ${count} hand-picked entries, each with a note on why it is worth using.`,
  };
}

export default async function ResourceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getResourceCategory(slug);
  if (!category) notFound();

  const entries = resources.filter((r) => r.category === slug);
  const others = resourceCategories.filter((c) => c.slug !== slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-(--muted-foreground)"
      >
        <Link href="/resources" className="transition-colors hover:text-(--foreground)">
          Resources
        </Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden />
        <span className="text-(--foreground)">{category.name}</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {entries.length} {category.name}
        </h1>
        <p className="mt-3 text-pretty text-lg text-(--muted-foreground)">{category.description}</p>
        <p className="mt-2 text-sm text-(--muted-foreground)">
          {/* The line that separates this from a link dump, said out loud. */}
          Every entry carries a note on why it is here, not just what it is.
        </p>
      </header>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <div key={entry.url} className="grid">
            <ResourceCard entry={entry} preview={previewPath(resourceSlug(entry.name))} />
          </div>
        ))}
      </div>

      <section className="mt-14 border-t border-(--border) pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
          Other categories
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/resources/category/${c.slug}`}
              className="rounded-lg border border-(--border) px-3 py-1.5 text-sm transition-colors hover:border-(--primary)/40 hover:bg-(--primary-muted)"
            >
              {c.name}
              <span className="ml-1.5 text-(--muted-foreground)">
                {resources.filter((r) => r.category === c.slug).length}
              </span>
            </Link>
          ))}
          <Link
            href="/resources"
            className="rounded-lg border border-(--border) px-3 py-1.5 text-sm transition-colors hover:border-(--primary)/40 hover:bg-(--primary-muted)"
          >
            Search all {resources.length} &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
