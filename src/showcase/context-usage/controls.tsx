"use client";

import * as React from "react";
import { ContextUsage, type ContextSegment } from "./context-usage";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const SETS: Record<string, ContextSegment[]> = {
  healthy: [
    { label: "System prompt & tools", tokens: 3_400 },
    { label: "Pinned files (2)", tokens: 11_200, evictionRank: 3 },
    { label: "Retrieved passages", tokens: 8_900, evictionRank: 1 },
    { label: "Conversation history", tokens: 14_600, evictionRank: 2 },
  ],
  tight: [
    { label: "System prompt & tools", tokens: 3_400 },
    { label: "Pinned files (2)", tokens: 11_200, evictionRank: 3 },
    { label: "Retrieved passages", tokens: 22_800, evictionRank: 1 },
    { label: "Conversation history", tokens: 76_500, evictionRank: 2 },
  ],
  over: [
    { label: "System prompt & tools", tokens: 3_400 },
    { label: "Pinned files (5)", tokens: 41_000, evictionRank: 3 },
    { label: "Retrieved passages", tokens: 22_800, evictionRank: 1 },
    { label: "Conversation history", tokens: 68_000, evictionRank: 2 },
  ],
};

const PREAMBLE = `// evictionRank: lower goes first. No rank means it cannot be dropped —
// which is what makes "pinned" a claim the component can check rather than
// a label somebody typed.
const SEGMENTS = [
  { label: "System prompt & tools", tokens: 3_400 },
  { label: "Retrieved passages",    tokens: 22_800, evictionRank: 1 },
  { label: "Conversation history",  tokens: 76_500, evictionRank: 2 },
  { label: "Pinned files (2)",      tokens: 11_200, evictionRank: 3 },
];`;

export const contextUsageControls: ComponentControls = {
  tag: "ContextUsage",
  importFrom: "./context-usage",
  controls: [
    {
      kind: "enum",
      name: "load",
      label: "How full",
      value: "tight",
      options: [
        { value: "healthy", label: "Comfortable" },
        { value: "tight", label: "Tight" },
        { value: "over", label: "Does not fit" },
      ],
    },
    { kind: "number", name: "window", label: "Context window", value: 128000, min: 8000, max: 1000000, step: 8000 },
    { kind: "number", name: "reserve", label: "Held for the reply", value: 8000, min: 0, max: 64000, step: 1000 },
    { kind: "boolean", name: "estimated", label: "Counted with another tokenizer", value: false },
  ],
  snippet: (v) => {
    const props = [
      `  window={${v.window}}`,
      "  segments={SEGMENTS}",
      Number(v.reserve) > 0 ? `  reserve={${v.reserve}}` : null,
      v.estimated ? "  estimated" : null,
    ].filter(Boolean);
    return `${PREAMBLE}\n\n<ContextUsage\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "healthy",
      title: "Comfortable",
      note: "Nothing to warn about, so nothing warns. The breakdown is still there because the question 'what is taking up the room' has an answer before it becomes urgent.",
      values: { load: "healthy", window: 128000, reserve: 8000, estimated: false },
    },
    {
      id: "tight",
      title: "Tight",
      note: "Past 85% of the usable window — usable meaning after the reply has its room. The warning names what gets dropped first rather than saying 'context is full'.",
      values: { load: "tight", window: 128000, reserve: 8000, estimated: false },
    },
    {
      id: "over",
      title: "Does not fit",
      note: "Over by more than the reserve. Without a reply reserve this would have read as 96% full — a request that cannot succeed, described as one that nearly can.",
      values: { load: "over", window: 128000, reserve: 8000, estimated: false },
    },
    {
      id: "estimated",
      title: "Estimated count",
      note: "The same text is a different number of tokens on a different model. A count carried over from another provider is decoration unless it is labelled.",
      values: { load: "healthy", window: 128000, reserve: 8000, estimated: true },
    },
  ],
};

export function renderContextUsage(v: ControlValues, key: string) {
  return (
    <ContextUsage
      key={key}
      window={Number(v.window)}
      segments={SETS[String(v.load)] ?? SETS.tight}
      reserve={Number(v.reserve)}
      estimated={Boolean(v.estimated)}
    />
  );
}
