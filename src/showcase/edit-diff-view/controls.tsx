"use client";

import * as React from "react";
import { EditDiffView } from "./edit-diff-view";
import { SEGMENTS, streamingSegments } from "./demos";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const PREAMBLE = `// The model sends the edit as segments: context verbatim, one edit per hunk,
// each with an id assigned before anything arrives. Streaming appends; a hunk
// still arriving has complete: false and cannot be decided.
const segments = [
  { type: "context", text: "# Getting started\\n\\n" },
  {
    type: "edit",
    id: "hunk-install",
    context: "Install command",
    original: "Run \`npm install\` …",
    edited: "Run \`pnpm install\` …",
  },
  // …one edit segment per hunk
];`;

export const editDiffViewControls: ComponentControls = {
  tag: "EditDiffView",
  importFrom: "./edit-diff-view",
  controls: [
    { kind: "text", name: "fileName", label: "File name", value: "docs/getting-started.md" },
    { kind: "boolean", name: "streaming", label: "Last hunk still arriving", value: false },
    { kind: "boolean", name: "wordDiff", label: "Word-level marks", value: true },
    { kind: "boolean", name: "collapseContext", label: "Collapse unchanged text", value: true },
  ],
  snippet: (v) => {
    const props = [
      `  segments={segments}`,
      v.fileName ? `  fileName="${v.fileName}"` : null,
      v.streaming ? "  streaming" : null,
      v.wordDiff ? null : "  wordDiff={false}",
      v.collapseContext ? null : "  collapseContext={false}",
    ].filter(Boolean);

    return `${PREAMBLE}\n\n<EditDiffView\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "settled",
      title: "All hunks arrived",
      note: "Three hunks of a doc edit, none decided. The count in the header is the reader's todo list.",
      values: { streaming: false, wordDiff: true, collapseContext: true },
    },
    {
      id: "streaming",
      title: "Mid-stream",
      note: "The last hunk is still arriving — its buttons stay disabled, and Accept all skips it, because half an edit is not decidable.",
      values: { streaming: true, wordDiff: true, collapseContext: true },
    },
    {
      id: "line-diff",
      title: "Line diff only",
      note: "Word marks off. Two whole lines repaint to move one token — the preset exists to show why the default is on.",
      values: { streaming: false, wordDiff: false, collapseContext: true },
    },
    {
      id: "whole-file",
      title: "Whole file",
      note: "Context rendered instead of collapsed. The segments are the same; collapseContext is a display choice, not a data choice.",
      values: { streaming: false, wordDiff: true, collapseContext: false },
    },
  ],
};

export function renderEditDiffView(v: ControlValues, key: string) {
  /* The streaming state shows the truncation statically — the animated version
     is the hero demo on the page. */
  const segments = v.streaming ? streamingSegments(34) : SEGMENTS;

  return (
    <EditDiffView
      key={key}
      segments={segments}
      fileName={String(v.fileName) || undefined}
      streaming={Boolean(v.streaming)}
      wordDiff={Boolean(v.wordDiff)}
      collapseContext={Boolean(v.collapseContext)}
    />
  );
}
