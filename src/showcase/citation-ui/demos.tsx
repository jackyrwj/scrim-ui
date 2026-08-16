"use client";

import * as React from "react";
import { InlineCitation, CitationList, type Citation } from "./citation-ui";

const CITATIONS: Citation[] = [
  {
    id: 1,
    title: "Claude Fable 5 and Mythos 5",
    url: "https://www.anthropic.com/news/claude-fable-5-mythos-5",
    domain: "anthropic.com",
    snippet:
      "Fable 5 is the most advanced generally available Claude model; Mythos 5 is available without safety measures to approved organizations only.",
  },
  {
    id: 2,
    title: "Prompt engineering for streaming UIs",
    url: "https://example.com/streaming-prompts",
    domain: "example.com",
    snippet: "Token-by-token rendering changes how users read and interrupt generated content.",
  },
  {
    id: 3,
    title: "Why agents need human approval",
    url: "https://example.com/agent-approval",
    domain: "example.com",
    snippet: "High-impact or irreversible actions warrant a human gate before execution.",
  },
];

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-200">
      {children}
    </p>
  );
}

export function DemoInline() {
  return (
    <div className="space-y-4">
      <Prose>
        The most capable models ship in two variants — one with{" "}
        <InlineCitation citation={CITATIONS[0]} /> additional safety measures, and one restricted to
        approved organizations. When rendering tokens incrementally, treat the stream as a
        first-class UX concern rather than a progress hack{" "}
        <InlineCitation citation={CITATIONS[1]} />.
      </Prose>
      <Prose>
        For actions with real-world consequences, a human-in-the-loop gate is not optional — it is
        the difference between a helpful assistant and an uncontrolled agent{" "}
        <InlineCitation citation={CITATIONS[2]} />.
      </Prose>
    </div>
  );
}

export function DemoBadge() {
  return (
    <div className="space-y-4">
      <Prose>
        Hover any marker to preview the source{" "}
        <InlineCitation citation={CITATIONS[0]} /> without leaving the answer.
      </Prose>
      <CitationList citations={CITATIONS} />
    </div>
  );
}

export function DemoHoverCard() {
  return (
    <Prose>
      The hover card shows title, domain and a two-line snippet — enough to judge relevance{" "}
      <InlineCitation citation={CITATIONS[1]} /> before deciding to open the source.
    </Prose>
  );
}

export function DemoSourceList() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <CitationList citations={CITATIONS} />
    </div>
  );
}
