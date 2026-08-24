"use client";

import { SearchToolCall } from "./search-tool-call";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** `title | url | snippet` per line. */
const RESULTS = [
  "Claude Fable 5 and Mythos 5 — Anthropic | https://www.anthropic.com/news/claude-fable-5-mythos-5 | Fable 5 is the most advanced generally available Claude model to date.",
  "Claude 5 family: model overview | https://docs.anthropic.com/models/overview | Capabilities, context windows and pricing for the Claude 5 line.",
  "Mythos class: safety and access | https://example.com/mythos-access | How the restricted-tier models differ and who can access them.",
].join("\n");

function parse(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, url, snippet] = line.split("|").map((p) => p.trim());
      return { title, url, snippet };
    });
}

export const searchToolCallControls: ComponentControls = {
  tag: "SearchToolCall",
  importFrom: "./search-tool-call",
  controls: [
    { kind: "text", name: "query", label: "Query", value: "Claude 5 model comparison" },
    {
      kind: "enum",
      name: "status",
      label: "Status",
      value: "done",
      options: [
        { value: "searching", label: "Searching" },
        { value: "done", label: "Done" },
        { value: "error", label: "Error" },
      ],
    },
    { kind: "text", name: "elapsed", label: "Elapsed", value: "1.4s" },
    { kind: "text", name: "results", label: "Results (title | url | snippet)", value: RESULTS, multiline: true },
  ],
  handlers: ["onStop", "onRetry"],
  derive: (v) => {
    if (v.status !== "done") return { props: { results: "[]" } };
    const body = parse(String(v.results))
      .map(
        (r) =>
          `  { title: ${JSON.stringify(r.title)}, url: ${JSON.stringify(r.url)}, snippet: ${JSON.stringify(r.snippet ?? "")} },`,
      )
      .join("\n");
    return { preamble: `const RESULTS = [\n${body}\n];`, props: { results: "RESULTS" } };
  },
  presets: [
    {
      id: "searching",
      title: "Searching",
      note: "The query is surfaced immediately with a spinner and a stop control.",
      values: { status: "searching", elapsed: "0.4s" },
    },
    {
      id: "done",
      title: "Results",
      note: "Compact source rows, open by default, so the reader can verify what was found.",
      values: { status: "done", elapsed: "1.4s" },
    },
    {
      id: "error",
      title: "Failed",
      note: "A recoverable error with retry — search failures are common and should not be fatal.",
      values: { status: "error", elapsed: "8.0s" },
    },
  ],
  remountOn: ["status"],
};

export function renderSearchToolCall(v: ControlValues, key: string) {
  return (
    <SearchToolCall
      key={key}
      query={String(v.query)}
      status={v.status as "searching" | "done" | "error"}
      elapsed={String(v.elapsed)}
      results={v.status === "done" ? parse(String(v.results)) : []}
      onStop={() => {}}
      onRetry={() => {}}
    />
  );
}
