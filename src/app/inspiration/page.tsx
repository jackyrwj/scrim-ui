import type { Metadata } from "next";
import { inspirationEntries } from "@/lib/inspiration";
import { InspirationCard } from "@/components/inspiration/entry-card";

export const metadata: Metadata = {
  title: "How Leading AI Products Solve Interface Problems",
  description:
    "Evidence-backed breakdowns of how leading AI products handle streaming, citations, approvals and agent state, rebuilt as live demos you can copy.",
};

export default function InspirationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="display-title text-3xl font-semibold tracking-tight sm:text-4xl">
        Inspiration
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        Study how leading AI products handle difficult interface decisions through live,
        copyable examples.
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
