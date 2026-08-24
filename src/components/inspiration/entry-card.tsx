import Link from "next/link";
import type { InspirationEntry } from "@/lib/inspiration";
import { BrandIcon } from "@/components/brands/brand-icon";

const KIND_LABEL: Record<string, string> = {
  "case-study": "Case study",
  guide: "Guide",
};

/**
 * One inspiration entry, as it appears on /inspiration and on the homepage.
 * Shared so the two never drift; see the note in resources/resource-card.tsx
 * on why there is no "use client" here.
 */
export function InspirationCard({
  entry,
  headingLevel = "h2",
}: {
  entry: InspirationEntry;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Link
      href={`/inspiration/${entry.slug}`}
      className="group flex h-full flex-col rounded-xl border border-(--border) bg-(--card) p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--primary)/40 hover:bg-(--muted)/60"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-(--border) px-2 py-0.5 text-[11px] font-medium text-(--muted-foreground)">
          {KIND_LABEL[entry.kind] ?? entry.kind}
        </span>
        <span className="text-xs text-(--muted-foreground)">
          {entry.componentSlugs.length} components
        </span>
      </div>

      {entry.product ? (
        <span className="mt-3 flex items-center gap-2 font-medium group-hover:underline">
          <span className="transition-transform duration-300 group-hover:scale-110">
            <BrandIcon name={entry.product} size={18} />
          </span>
          {entry.product}
        </span>
      ) : (
        <span className="mt-3 flex items-center gap-2 font-medium text-(--muted-foreground) group-hover:underline">
          Decision guide
        </span>
      )}

      <Heading className="mt-1.5 text-lg font-semibold leading-6 tracking-tight">
        {entry.title}
      </Heading>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-(--muted-foreground)">
        {entry.summary}
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium">
        Read {entry.kind === "guide" ? "guide" : "breakdown"}{" "}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
