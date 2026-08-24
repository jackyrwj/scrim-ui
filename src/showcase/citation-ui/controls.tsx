"use client";

import * as React from "react";
import { InlineCitation, CitationList, type Citation } from "./citation-ui";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

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

const PREAMBLE = `const CITATIONS = [
  { id: 1, title: "Claude Fable 5 and Mythos 5", url: "https://www.anthropic.com/news/claude-fable-5-mythos-5", domain: "anthropic.com", snippet: "…" },
  { id: 2, title: "Prompt engineering for streaming UIs", url: "https://example.com/streaming-prompts", domain: "example.com", snippet: "…" },
  { id: 3, title: "Why agents need human approval", url: "https://example.com/agent-approval", domain: "example.com", snippet: "…" },
];`;

const MARKERS = `<p>
  The most capable models ship in two variants — one with{" "}
  <InlineCitation citation={CITATIONS[0]} /> additional safety measures, and one
  restricted to approved organizations <InlineCitation citation={CITATIONS[1]} />.
</p>`;

const LIST = `<CitationList citations={CITATIONS} />`;

/**
 * The one component here whose states are compositions, not prop sets: the
 * question is whether markers appear in prose, whether the source list appears
 * under them, or both. So the schema writes its own snippet rather than
 * generating one from props.
 */
export const citationUiControls: ComponentControls = {
  tag: "InlineCitation, CitationList",
  importFrom: "./citation-ui",
  controls: [
    {
      kind: "enum",
      name: "layout",
      label: "Layout",
      value: "both",
      options: [
        { value: "inline", label: "Markers in prose" },
        { value: "list", label: "Source list" },
        { value: "both", label: "Markers + list" },
      ],
    },
  ],
  snippet: (v) => {
    const parts =
      v.layout === "inline" ? [MARKERS] : v.layout === "list" ? [LIST] : [MARKERS, LIST];
    return `${PREAMBLE}\n\n${parts.join("\n\n")}\n`;
  },
  presets: [
    {
      id: "inline",
      title: "Inline markers",
      note: "Numbered markers in prose. Hover or focus previews the source without leaving the answer.",
      values: { layout: "inline" },
    },
    {
      id: "list",
      title: "Source list",
      note: "The numbered reference list that pairs with the markers.",
      values: { layout: "list" },
    },
    {
      id: "both",
      title: "Markers + list",
      note: "The canonical citation pattern — markers in text, full list beneath.",
      values: { layout: "both" },
    },
  ],
};

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-200">{children}</p>;
}

export function renderCitationUi(v: ControlValues, key: string) {
  const showMarkers = v.layout !== "list";
  const showList = v.layout !== "inline";
  return (
    <div key={key} className="space-y-4">
      {showMarkers && (
        <Prose>
          The most capable models ship in two variants — one with{" "}
          <InlineCitation citation={CITATIONS[0]} /> additional safety measures, and one restricted
          to approved organizations. Treat a token stream as a UX concern rather than a progress
          hack <InlineCitation citation={CITATIONS[1]} />.
        </Prose>
      )}
      {showList && <CitationList citations={CITATIONS} />}
    </div>
  );
}
