"use client";

import * as React from "react";
import { SourceList, type RetrievedSource } from "./source-list";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const SOURCES: RetrievedSource[] = [
  { id: "s1", title: "chunking.md · lines 12–18", score: 0.834, passage: "Chunks are stored as positions, not strings. Every chunk carries the start and end offset it was cut from, and the invariant is asserted in development." },
  { id: "s2", title: "streaming.md · lines 3–7", score: 0.791, passage: "Sources are written to the stream as a data part before the first token of the answer, so a marker mid-answer resolves the moment it appears." },
  { id: "s3", title: "retrieval.md · lines 40–46", score: 0.552, passage: "The relevance floor is applied before the model call, not after. A candidate under the floor is not a weak source, it is not a source." },
  { id: "s4", title: "readme.md · lines 1–6", score: 0.271, passage: "A Next.js application demonstrating retrieval-augmented generation with inline citations." },
  { id: "s5", title: "package.json · lines 1–4", score: 0.184, passage: '{ "name": "rag-qa", "private": true, "version": "0.1.0" }' },
];

const PREAMBLE = `// Every candidate considered, not only the ones that passed — the panel is
// what lets you tell "nothing relevant existed" from "the model made it up".
const SOURCES = retrieved; // [{ id, title, passage, score }, …]`;

export const sourceListControls: ComponentControls = {
  tag: "SourceList",
  importFrom: "./source-list",
  controls: [
    { kind: "number", name: "floor", label: "Relevance floor", value: 0.35, min: 0, max: 1, step: 0.01 },
    { kind: "boolean", name: "clickable", label: "Rows jump to the document", value: true },
  ],
  snippet: (v) => {
    const props = [
      "  sources={SOURCES}",
      Number(v.floor) > 0 ? `  floor={${v.floor}}` : null,
      v.clickable ? "  onOpen={(id) => scrollToPassage(id)}" : null,
    ].filter(Boolean);
    return `${PREAMBLE}\n\n<SourceList\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "ranked",
      title: "Ranked",
      note: "Two passages cleared 0.35 and three did not. The three are one click away, because their scores are how you tune the floor.",
      values: { floor: 0.35, clickable: true },
    },
    {
      id: "empty",
      title: "Nothing cleared it",
      note: "Raise the floor past the best candidate. This is the state that makes the rest of the system trustworthy — no model call, a fixed answer, and the near-miss shown so you can judge the threshold.",
      values: { floor: 0.9, clickable: false },
    },
    {
      id: "nofloor",
      title: "No floor set",
      note: "Everything passes, including a package.json fragment at 0.18. This is what a retrieval system does by default, and why the floor exists.",
      values: { floor: 0, clickable: false },
    },
  ],
};

export function renderSourceList(v: ControlValues, key: string) {
  return (
    <SourceList
      key={key}
      sources={SOURCES}
      floor={Number(v.floor)}
      onOpen={v.clickable ? () => {} : undefined}
    />
  );
}
