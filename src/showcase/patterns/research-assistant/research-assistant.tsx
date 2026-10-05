"use client";

import { Card } from "@/components/ui/card";
import * as React from "react";
import { SearchToolCall, type SearchResult } from "../../search-tool-call/search-tool-call";
import { Reasoning } from "../../reasoning/reasoning";
import { SourceCard } from "../../source-card/source-card";
import { InlineCitation, CitationList, type Citation } from "../../citation-ui/citation-ui";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const SEARCH_RESULTS: SearchResult[] = [
  {
    title: "Claude Fable 5 and Mythos 5 — Anthropic",
    url: "https://www.anthropic.com/news/claude-fable-5-mythos-5",
    snippet: "Fable 5 is the most advanced generally available Claude model to date.",
  },
  {
    title: "Claude 5 family: model overview",
    url: "https://docs.anthropic.com/models/overview",
    snippet: "Capabilities, context windows and pricing for the Claude 5 line.",
  },
  {
    title: "Anthropic model pricing",
    url: "https://docs.anthropic.com/pricing",
    snippet: "Per-token pricing for Opus, Sonnet and Haiku tiers.",
  },
];

const REASONING_STEPS = [
  {
    title: "Parsed the question",
    detail: "The user asks for the latest Claude 5 tier and its pricing.",
  },
  {
    title: "Formulated queries",
    detail: "Ran two searches: model capabilities and per-tier pricing.",
  },
  {
    title: "Cross-checked sources",
    detail: "Matched official docs against release notes.",
  },
  {
    title: "Synthesized the answer",
    detail: "Combined 3 sources into a single recommendation.",
  },
];

const SOURCES: Citation[] = [
  {
    id: 1,
    title: "Claude Fable 5 and Mythos 5",
    url: "https://www.anthropic.com/news/claude-fable-5-mythos-5",
    domain: "anthropic.com",
    snippet: "Fable 5 is the most advanced generally available Claude model.",
  },
  {
    id: 2,
    title: "Claude 5 family: model overview",
    url: "https://docs.anthropic.com/models/overview",
    domain: "docs.anthropic.com",
  },
  {
    id: 3,
    title: "Anthropic model pricing",
    url: "https://docs.anthropic.com/pricing",
    domain: "docs.anthropic.com",
  },
];

/* ------------------------------------------------------------------ */
/* ResearchAssistantPattern                                            */
/* ------------------------------------------------------------------ */

export function ResearchAssistantPattern() {
  const [phase, setPhase] = React.useState<0 | 1 | 2>(0);

  React.useEffect(() => {
    if (phase !== 0) return;
    const t = window.setTimeout(() => setPhase(1), 3200);
    return () => window.clearTimeout(t);
  }, [phase]);

  React.useEffect(() => {
    if (phase !== 1) return;
    const t = window.setTimeout(() => setPhase(2), 3600);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <Card className="gap-0 py-0 rounded-xl border border-border bg-card">
      {/* Question header */}
      <div className="border-b border-border px-5 py-4">
        <p className="text-xs font-medium text-muted-foreground">Research Question</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">
          Which Claude 5 model is most cost-effective for a high-volume support bot?
        </h3>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
        {/* Main column */}
        <div className="min-w-0 space-y-4">
          {/* Search tools */}
          <div className="space-y-2">
            <SearchToolCall
              query="Claude 5 model comparison"
              status={phase >= 1 ? "done" : "searching"}
              results={SEARCH_RESULTS.slice(0, 2)}
              elapsed={phase >= 1 ? "2.4s" : "1.4s"}
            />
            <SearchToolCall
              query="Claude 5 pricing per token"
              status={phase >= 1 ? "done" : "searching"}
              results={SEARCH_RESULTS.slice(2)}
              elapsed={phase >= 1 ? "1.9s" : "0.8s"}
            />
          </div>

          {/* Reasoning */}
          <Reasoning steps={REASONING_STEPS} elapsed="3.1s" isThinking={phase === 0} />

          {/* Answer */}
          {phase === 2 && (
            <div className="space-y-3 rounded-xl border border-border p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Final Answer
              </p>
              <p className="text-sm leading-7 text-foreground">
                For high-volume support traffic, <strong>Claude Haiku 4.5</strong> is the most
                cost-effective tier: it keeps per-token cost a fraction of Opus while still handling
                the routine routing and drafting that support bots handle best{" "}
                <InlineCitation citation={SOURCES[0]} />. Reserve Opus{" "}
                <InlineCitation citation={SOURCES[1]} /> for escalation paths where reasoning quality
                outweighs cost. At scale, streaming with Haiku keeps first-token latency low and the
                bill predictable <InlineCitation citation={SOURCES[2]} />.
              </p>
              <CitationList citations={SOURCES} />
            </div>
          )}
        </div>

        {/* Sources sidebar */}
        <aside className="hidden lg:block">
          <p className="text-xs font-medium text-muted-foreground">Sources</p>
          <div className="mt-2 space-y-2">
            {SEARCH_RESULTS.map((r, i) => (
              <SourceCard key={i} title={r.title} url={r.url} snippet={r.snippet} index={i + 1} />
            ))}
          </div>
        </aside>
      </div>
    </Card>
  );
}
