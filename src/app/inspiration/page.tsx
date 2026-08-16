import type { Metadata } from "next";
import Link from "next/link";
import { inspirationEntries } from "@/lib/inspiration";

export const metadata: Metadata = {
  title: "Inspiration — AI UI Pattern Breakdowns",
  description:
    "Element-by-element UI breakdowns of ChatGPT, Claude, Perplexity, Cursor and more — what each pattern does, why it works, and how to build it.",
};

export default function InspirationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Inspiration</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        UI pattern breakdowns of the products defining AI interfaces. Each article analyses
        the interactions element by element — with a live demo of the pattern you can copy.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {inspirationEntries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/inspiration/${entry.slug}`}
            className="group flex flex-col rounded-xl border border-(--border) bg-(--card) p-6 transition-colors hover:bg-(--muted)/60"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium group-hover:underline">{entry.product}</span>
              <span className="text-xs text-(--muted-foreground)">
                {entry.componentSlugs.length} components
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold leading-6 tracking-tight">{entry.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-(--muted-foreground)">
              {entry.summary}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
              Read breakdown <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-sm text-(--muted-foreground)">
        More products coming soon — Notion AI, Gemini, Replit and Lovable are in the queue.
      </p>
    </div>
  );
}
