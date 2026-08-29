import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ImageOff } from "lucide-react";
import { OutboundLink } from "@/components/site/outbound-link";
import {
  getResource,
  getResourceCategory,
  relatedResources,
  resourceHost,
  resourceSlug,
  resources,
  type ResourceEntry,
} from "@/lib/resources";
import { previewPath } from "@/lib/previews";
import { BrandIcon } from "@/components/brands/brand-icon";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return resources.map((entry) => ({ slug: resourceSlug(entry.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getResource(slug);
  if (!entry) return { title: "Resource" };
  return {
    // The root layout appends " — Scrim UI".
    title: `${entry.name} — ${getResourceCategory(entry.category)?.name ?? "Resource"}`,
    description: entry.description,
    alternates: { canonical: `/resources/${slug}` },
  };
}

/** One label/value pair in the fact strip under the title. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

function RelatedCard({ entry }: { entry: ResourceEntry }) {
  return (
    <Link
      href={`/resources/${resourceSlug(entry.name)}`}
      className="flex flex-col rounded-xl border border-(--border) p-4 transition-colors hover:border-(--muted-foreground)/50"
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <BrandIcon name={entry.name} size={18} />
        {entry.name}
      </span>
      <span className="mt-1.5 line-clamp-2 text-xs leading-5 text-(--muted-foreground)">
        {entry.description}
      </span>
    </Link>
  );
}

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = getResource(slug);
  if (!entry) notFound();

  const category = getResourceCategory(entry.category);
  const preview = previewPath(slug);
  const related = relatedResources(entry);
  const host = resourceHost(entry.url);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-(--muted-foreground)">
        <Link href="/resources" className="transition-colors hover:text-(--foreground)">
          Resources
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/resources/category/${entry.category}`}
          className="transition-colors hover:text-(--foreground)"
        >
          {category?.name ?? entry.category}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-(--foreground)">{entry.name}</span>
      </nav>

      {/* Header */}
      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-(--border)">
          <BrandIcon name={entry.name} size={32} />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{entry.name}</h1>
          <p className="mt-3 text-pretty text-lg leading-7 text-(--muted-foreground)">
            {entry.notes}
          </p>
          {entry.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-(--muted) px-2.5 py-0.5 text-[11px] text-(--muted-foreground)"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {/* Fact strip */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-y border-(--border) py-5">
        <dl className="flex flex-wrap gap-x-8 gap-y-5">
          <Fact label="Publisher">{host}</Fact>
          <Fact label="Type">{category?.name ?? entry.category}</Fact>
          <Fact label="Pricing">{entry.free ? "Free tier available" : "Paid"}</Fact>
          <Fact label="Built for AI">{entry.ai_native ? "AI-native" : "General purpose"}</Fact>
          <Fact label="Listing">{entry.source === "official" ? "Official site" : "Community"}</Fact>
        </dl>
        <OutboundLink
          href={entry.url}
          item={resourceSlug(entry.name)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-(--foreground) px-4 py-2 text-sm font-medium text-(--background) transition-opacity hover:opacity-90"
        >
          Visit website
          <ExternalLink className="size-4" aria-hidden />
        </OutboundLink>
      </div>

      {/* Preview */}
      <figure className="mt-8">
        <div className="overflow-hidden rounded-xl border border-(--border) bg-(--muted)">
          {preview ? (
            <Image
              src={preview}
              alt={`Screenshot of the ${entry.name} homepage`}
              width={1280}
              height={800}
              sizes="(min-width: 896px) 896px, 100vw"
              className="w-full"
              priority
            />
          ) : (
            <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 text-(--muted-foreground)">
              <ImageOff className="size-6" aria-hidden />
              <p className="text-sm">No preview captured for this site yet</p>
            </div>
          )}
        </div>
        <figcaption className="mt-2 text-xs text-(--muted-foreground)">
          {preview
            ? `Screenshot of ${host}, captured for reference. `
            : ""}
          The live product, its pricing and its terms are on the official site.
        </figcaption>
      </figure>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            More in {category?.name ?? entry.category}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <RelatedCard key={r.url} entry={r} />
            ))}
          </div>
          <Link
            href={`/resources/category/${entry.category}`}
            className="mt-4 inline-block text-sm font-medium transition-colors hover:text-(--muted-foreground)"
          >
            Browse all {category?.name ?? entry.category} →
          </Link>
        </section>
      )}

      <p className="mt-12 border-t border-(--border) pt-6 text-xs leading-5 text-(--muted-foreground)">
        This page is a curated listing, not affiliated with {entry.name}. Features, pricing and
        terms are set by {host} and can change — confirm them there before relying on the tool.
      </p>
    </div>
  );
}
