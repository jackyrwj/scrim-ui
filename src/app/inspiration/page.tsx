import type { Metadata } from "next";
import { inspirationEntries } from "@/lib/inspiration";
import { InspirationCard } from "@/components/inspiration/entry-card";
import { AdsterraBanner } from "@/components/ads/adsterra-banner";
import { CatalogHeader } from "@/components/site/catalog-header";

export const metadata: Metadata = {
  title: "How Leading AI Products Solve Interface Problems",
  description:
    "Evidence-backed breakdowns of how leading AI products handle streaming, citations, approvals and agent state, rebuilt as live demos you can copy.",
};

export default function InspirationPage() {
  return (
    <div className="catalog-page">
      <CatalogHeader eyebrow="The design inspiration" title="Inspiration">
        See how ChatGPT, Claude, Cursor, and others handle streaming, citations, approvals,
        and agent state — grounded in official docs and rebuilt as live demos.
      </CatalogHeader>

      <AdsterraBanner />

      <div className="mt-12 space-y-14">
        {[
          { slug: "case-study", name: "Product studies" },
          { slug: "guide", name: "Design guides" },
        ].map((group) => {
          const entries = inspirationEntries.filter((entry) => entry.kind === group.slug);
          return (
            <section key={group.slug} id={group.slug} className="scroll-mt-24">
              <div className="mb-5 flex items-baseline justify-between gap-3">
                <h2 className="text-base font-medium tracking-[-0.01em]">{group.name}</h2>
                <span className="text-xs tabular-nums text-(--muted-foreground)">{entries.length} articles</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {entries.map((entry) => <InspirationCard key={entry.slug} entry={entry} />)}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-12 text-sm text-(--muted-foreground)">
        More coming soon — Notion AI, Gemini, Replit and Lovable case studies, plus
        more decision guides.
      </p>
    </div>
  );
}
