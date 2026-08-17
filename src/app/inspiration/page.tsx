import type { Metadata } from "next";
import Link from "next/link";
import { inspirationEntries } from "@/lib/inspiration";
import { BrandIcon } from "@/components/brands/brand-icon";

export const metadata: Metadata = {
  title: "Inspiration — AI UI Patterns & Decision Guides",
  description:
    "Evidence-driven articles on AI interfaces: element-by-element breakdowns of ChatGPT, Claude, Perplexity, Cursor and more, plus decision guides on when to stream, how to cite, how to show progress — each grounded in official docs with a live demo you can copy.",
};

const KIND_LABEL: Record<string, string> = {
  "case-study": "Case study",
  guide: "Guide",
};

export default function InspirationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Inspiration</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        Evidence-driven articles on AI interfaces — product breakdowns that analyse a
        specific app element by element, and decision guides that answer one open
        question with concrete recommendations. Every claim is grounded in the
        product&rsquo;s official docs and paired with a live demo you can copy.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {inspirationEntries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/inspiration/${entry.slug}`}
            className="group flex flex-col rounded-xl border border-(--border) bg-(--card) p-6 transition-colors hover:bg-(--muted)/60"
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
                <BrandIcon name={entry.product} size={18} />
                {entry.product}
              </span>
            ) : (
              <span className="mt-3 flex items-center gap-2 font-medium text-(--muted-foreground) group-hover:underline">
                Decision guide
              </span>
            )}

            <h2 className="mt-1.5 text-lg font-semibold leading-6 tracking-tight">
              {entry.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-(--muted-foreground)">
              {entry.summary}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
              Read {entry.kind === "guide" ? "guide" : "breakdown"}{" "}
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-sm text-(--muted-foreground)">
        More coming soon — Notion AI, Gemini, Replit and Lovable case studies, plus
        more decision guides.
      </p>
    </div>
  );
}
