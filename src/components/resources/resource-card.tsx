import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { resourceSlug, type ResourceEntry } from "@/lib/resources";
import { BrandIcon } from "@/components/brands/brand-icon";
import { OutboundLink } from "@/components/site/outbound-link";

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
    green:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
    neutral: "bg-(--muted) text-(--muted-foreground)",
  }[tone];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${toneCls}`}
    >
      {children}
    </span>
  );
}

export function ResourceCard({
  entry,
  headingLevel = "h2",
  preview,
  showNotes = true,
}: {
  entry: ResourceEntry;
  /** h2 on /resources, where the page h1 is the only heading above these;
   *  h3 on the homepage, where each section already owns an h2. */
  headingLevel?: "h2" | "h3";
  /** Captured screenshot from public/previews, passed in rather than looked
   *  up: previewPath reads the filesystem and this card is also imported by
   *  the client-side resources browser.
   *
   *  Only the homepage passes it. /resources lists all 102 entries, and 102
   *  screenshots is 9.6MB of page — a directory you filter and scan is not
   *  the place to spend that. */
  preview?: string | null;
  /** The "Why we list it" line. On by default; the homepage turns it off —
   *  eight of them is 134 words of the same text that already carries an
   *  <h2> on /resources/[slug], and it made the cards the tallest thing on
   *  the page. The field itself stays: /resources searches against it. */
  showNotes?: boolean;
}) {
  const href = `/resources/${resourceSlug(entry.name)}`;
  const Heading = headingLevel;
  return (
    <article
      className={`group relative @container flex h-full flex-col rounded-xl border border-(--border) bg-(--card) transition-all duration-300 hover:-translate-y-0.5 hover:border-(--primary)/40 hover:shadow-[var(--shadow-sm)] ${
        preview ? "overflow-hidden" : "p-4"
      }`}
    >
      {preview && (
        <div className="rp" aria-hidden>
          <Image
            src={preview}
            alt=""
            width={1280}
            height={800}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="rp-shot"
          />
        </div>
      )}
      <div className={`flex flex-1 flex-col ${preview ? "p-4" : ""}`}>
        {/* Below ~320px of card — the 4-column grid on the homepage — a name
            competing with two badges for one row broke names mid-word
            ("assistant-/ui"). There the badges take their own line and the
            name gets the full width; wider cards keep them on one row. */}
        <div className="@max-[320px]:flex-col @max-[320px]:items-start flex items-start justify-between gap-x-3 gap-y-1.5">
          <Heading className="flex min-w-0 items-center gap-2.5 font-medium leading-snug">
            <span className="transition-transform duration-300 group-hover:scale-110">
              <BrandIcon name={entry.name} />
            </span>
            {/* Stretched link: the whole card opens our detail page, while the
              "official site" link below stays separately clickable via z-10. */}
            <Link
              href={href}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {entry.name}
            </Link>
          </Heading>
          <div className="flex shrink-0 gap-1.5">
            <Badge tone={entry.free ? "green" : "neutral"}>
              {entry.free ? "Free" : "Paid"}
            </Badge>
            {entry.ai_native && <Badge tone="violet">AI-native</Badge>}
          </div>
        </div>
        <p className="mt-1.5 text-sm leading-6 text-(--muted-foreground)">
          {entry.description}
        </p>
        {showNotes && entry.notes && (
          <p className="mt-2 text-sm leading-6">
            <span className="font-medium text-(--foreground)">
              Why we list it:{" "}
            </span>
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
          <OutboundLink
            href={entry.url}
            item={resourceSlug(entry.name)}
            className="relative z-10 inline-flex items-center gap-0.5 transition-colors hover:text-(--foreground)"
          >
            Official site
            <ArrowUpRight
              className="size-3 transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px"
              aria-hidden
            />
          </OutboundLink>
        </div>
      </div>
    </article>
  );
}
