import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { resourceSlug, type ResourceEntry } from "@/lib/resources";
import { BrandIcon } from "@/components/brands/brand-icon";

/**
 * One resource, as it appears anywhere on the site.
 *
 * Lives outside resources-browser.tsx so the homepage can show the same card
 * the directory shows. No "use client": imported by the browser it joins the
 * client bundle, imported by the homepage it renders on the server, and there
 * is still only one definition of what a resource looks like.
 */
function Badge({
  tone,
  children,
}: {
  tone: "green" | "violet" | "neutral";
  children: React.ReactNode;
}) {
  const toneCls = {
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
    neutral: "bg-(--muted) text-(--muted-foreground)",
  }[tone];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${toneCls}`}>
      {children}
    </span>
  );
}

export function ResourceCard({
  entry,
  headingLevel = "h2",
}: {
  entry: ResourceEntry;
  /** h2 on /resources, where the page h1 is the only heading above these;
   *  h3 on the homepage, where each section already owns an h2. */
  headingLevel?: "h2" | "h3";
}) {
  const href = `/resources/${resourceSlug(entry.name)}`;
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-(--border) bg-(--card) p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--primary)/40 hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <Heading className="flex items-center gap-2.5 font-medium leading-snug">
          <span className="transition-transform duration-300 group-hover:scale-110">
            <BrandIcon name={entry.name} />
          </span>
          {/* Stretched link: the whole card opens our detail page, while the
              "official site" link below stays separately clickable via z-10. */}
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {entry.name}
          </Link>
        </Heading>
        <div className="flex shrink-0 gap-1.5">
          <Badge tone={entry.free ? "green" : "neutral"}>{entry.free ? "Free" : "Paid"}</Badge>
          {entry.ai_native && <Badge tone="violet">AI-native</Badge>}
        </div>
      </div>
      <p className="mt-1.5 text-sm leading-6 text-(--muted-foreground)">{entry.description}</p>
      {entry.notes && (
        <p className="mt-2 text-sm leading-6">
          <span className="font-medium text-(--foreground)">Why we list it: </span>
          <span className="text-(--muted-foreground)">{entry.notes}</span>
        </p>
      )}
      {entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-(--border) px-2 py-0.5 text-[11px] text-(--muted-foreground)"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-[11px] text-(--muted-foreground)">
        <span>source: {entry.source}</span>
        <a
          href={entry.url}
          target="_blank"
          rel="noreferrer noopener"
          className="relative z-10 inline-flex items-center gap-0.5 transition-colors hover:text-(--foreground)"
        >
          Official site
          <ArrowUpRight
            className="size-3 transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px"
            aria-hidden
          />
        </a>
      </div>
    </article>
  );
}
