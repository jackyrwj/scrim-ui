import type { Metadata } from "next";
import { inspirationEntries } from "@/lib/inspiration";
import { InspirationCard } from "@/components/inspiration/entry-card";

export const metadata: Metadata = {
  title: "Inspiration — AI UI Patterns & Decision Guides",
  description:
    "Evidence-driven articles on AI interfaces: element-by-element breakdowns of ChatGPT, Claude, Perplexity, Cursor and more, plus decision guides on when to stream, how to cite, how to show progress — each grounded in official docs with a live demo you can copy.",
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
          <InspirationCard key={entry.slug} entry={entry} />
        ))}
      </div>

      <p className="mt-12 text-sm text-(--muted-foreground)">
        More coming soon — Notion AI, Gemini, Replit and Lovable case studies, plus
        more decision guides.
      </p>
    </div>
  );
}
