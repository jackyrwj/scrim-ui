"use client";

import { MemoryList } from "./memory-list";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** One fact per line — the reader edits the collection as text, and `derive`
 *  turns it back into the array literal the snippet needs. */
const SAMPLE = [
  "Prefers TypeScript with strict mode on",
  "Works in Shenzhen, UTC+8",
  "Ships design-system work in Tailwind, not CSS modules",
].join("\n");

function parse(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export const memoryListControls: ComponentControls = {
  tag: "MemoryList",
  importFrom: "./memory-list",
  controls: [
    { kind: "text", name: "title", label: "Title", value: "Memory" },
    {
      kind: "text",
      name: "description",
      label: "Description",
      value: "Facts the assistant keeps across conversations",
      multiline: true,
    },
    { kind: "text", name: "items", label: "Items (one per line)", value: SAMPLE, multiline: true },
    { kind: "text", name: "emptyText", label: "Empty text", value: "Nothing saved yet." },
  ],
  handlers: ["onAdd", "onForget"],
  derive: (v) => {
    const items = parse(String(v.items));
    if (items.length === 0) return { props: { items: "[]" } };
    const body = items
      .map((text, i) => `  { id: "m${i + 1}", text: ${JSON.stringify(text)} },`)
      .join("\n");
    return { preamble: `const ITEMS = [\n${body}\n];`, props: { items: "ITEMS" } };
  },
  presets: [
    {
      id: "default",
      title: "Default",
      note: "The assistant's working memory — add a fact, forget an old one.",
      values: { items: SAMPLE },
    },
    {
      id: "empty",
      title: "Empty",
      note: "First run. Say what belongs here before anything is saved.",
      values: { items: "" },
    },
  ],
};

export function renderMemoryList(v: ControlValues, key: string) {
  return (
    <MemoryList
      key={key}
      title={String(v.title)}
      description={String(v.description)}
      emptyText={String(v.emptyText)}
      items={parse(String(v.items)).map((text, i) => ({ id: `m${i + 1}`, text }))}
      onAdd={() => {}}
      onForget={() => {}}
    />
  );
}
