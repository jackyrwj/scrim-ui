"use client";

import { Reasoning } from "./reasoning";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** `title — detail` per line; the detail is optional. */
const RESEARCH = [
  "Parsed the question — Identified the entity and the comparison dimension.",
  "Formulated search queries — 3 queries across pricing and documentation.",
  "Scored candidate sources — Ranked 12 results by recency and domain authority.",
  "Synthesized the answer — Combined 4 sources into a single recommendation.",
].join("\n");

const CODING = [
  "Located the auth module",
  "Traced the token refresh flow — token.ts → refresh() → apiClient",
  "Identified the race condition — Two concurrent refreshes both read a stale token.",
  "Prepared a single-flight fix",
].join("\n");

function parse(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, detail] = line.split("—").map((p) => p.trim());
      return detail ? { title, detail } : { title };
    });
}

export const reasoningControls: ComponentControls = {
  tag: "Reasoning",
  importFrom: "./reasoning",
  controls: [
    { kind: "text", name: "steps", label: "Steps (title — detail)", value: RESEARCH, multiline: true },
    { kind: "boolean", name: "isThinking", label: "Still thinking", value: false },
    { kind: "text", name: "elapsed", label: "Elapsed", value: "6.4s" },
    { kind: "boolean", name: "defaultOpen", label: "Open by default", value: true },
  ],
  handlers: ["onStop"],
  derive: (v) => {
    const steps = parse(String(v.steps));
    const body = steps
      .map(
        (s) =>
          `  { title: ${JSON.stringify(s.title)}${s.detail ? `, detail: ${JSON.stringify(s.detail)}` : ""} },`,
      )
      .join("\n");
    return { preamble: `const STEPS = [\n${body}\n];`, props: { steps: "STEPS" } };
  },
  presets: [
    {
      id: "thinking",
      title: "Thinking",
      note: "A live timer and spinner signal active reasoning, with a stop control.",
      values: { steps: RESEARCH, isThinking: true, elapsed: "2.1s", defaultOpen: true },
    },
    {
      id: "complete",
      title: "Complete",
      note: "Steps render as a numbered timeline with a completion confirmation.",
      values: { steps: RESEARCH, isThinking: false, elapsed: "6.4s", defaultOpen: true },
    },
    {
      id: "collapsed",
      title: "Collapsed",
      note: "One line once the reader has seen it — the trace should not dominate the answer.",
      values: { steps: RESEARCH, isThinking: false, elapsed: "6.4s", defaultOpen: false },
    },
    {
      id: "coding",
      title: "Coding trace",
      note: "Traces adapt per domain; here the steps read like a debugging session.",
      values: { steps: CODING, isThinking: false, elapsed: "4.8s", defaultOpen: true },
    },
  ],
  remountOn: ["defaultOpen", "isThinking"],
};

export function renderReasoning(v: ControlValues, key: string) {
  return (
    <Reasoning
      key={key}
      steps={parse(String(v.steps))}
      isThinking={Boolean(v.isThinking)}
      elapsed={String(v.elapsed)}
      defaultOpen={Boolean(v.defaultOpen)}
      onStop={() => {}}
    />
  );
}
