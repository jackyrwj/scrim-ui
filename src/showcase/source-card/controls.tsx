"use client";

import { SourceCard } from "./source-card";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const sourceCardControls: ComponentControls = {
  tag: "SourceCard",
  importFrom: "./source-card",
  controls: [
    { kind: "number", name: "index", label: "Index", value: 1, min: 1, max: 9 },
    { kind: "text", name: "title", label: "Title", value: "Claude Fable 5 and Mythos 5" },
    {
      kind: "text",
      name: "url",
      label: "URL",
      value: "https://www.anthropic.com/news/claude-fable-5-mythos-5",
    },
    { kind: "text", name: "domain", label: "Domain", value: "anthropic.com" },
    {
      kind: "text",
      name: "snippet",
      label: "Snippet",
      value:
        "Fable 5 is the most advanced generally available Claude model; Mythos 5 is restricted to approved organizations.",
      multiline: true,
    },
  ],
  presets: [
    {
      id: "with-snippet",
      title: "With snippet",
      note: "Two lines of context help the reader judge relevance before clicking.",
      values: {},
    },
    {
      id: "compact",
      title: "Compact",
      note: "Title and domain only — for a sidebar or a footnote list.",
      values: { snippet: "" },
    },
  ],
};

export function renderSourceCard(v: ControlValues, key: string) {
  return (
    <SourceCard
      key={key}
      index={Number(v.index)}
      title={String(v.title)}
      url={String(v.url)}
      domain={String(v.domain)}
      snippet={v.snippet ? String(v.snippet) : undefined}
    />
  );
}
