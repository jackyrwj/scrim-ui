"use client";

import { ContextFiles } from "./context-files";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** `name — detail` per line. */
const SAMPLE = [
  "auth/token.ts — ≈ 1.2k tokens",
  "auth/refresh.ts — ≈ 840 tokens",
  "design-tokens.json — 48 KB",
].join("\n");

function parse(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, detail] = line.split("—").map((p) => p.trim());
      return { name, detail };
    });
}

export const contextFilesControls: ComponentControls = {
  tag: "ContextFiles",
  importFrom: "./context-files",
  controls: [
    { kind: "text", name: "title", label: "Title", value: "In context" },
    {
      kind: "text",
      name: "files",
      label: "Files (name — detail)",
      value: SAMPLE,
      multiline: true,
    },
    { kind: "number", name: "used", label: "Tokens used", value: 18000, min: 0, max: 128000, step: 1000 },
    { kind: "number", name: "limit", label: "Context window", value: 128000, min: 8000, max: 200000, step: 8000 },
  ],
  handlers: ["onRemove"],
  derive: (v) => {
    const files = parse(String(v.files));
    const body = files
      .map((f) => `  { name: ${JSON.stringify(f.name)}, detail: ${JSON.stringify(f.detail ?? "")} },`)
      .join("\n");
    return {
      preamble: files.length ? `const FILES = [\n${body}\n];` : undefined,
      props: {
        files: files.length ? "FILES" : "[]",
        usage: `{ used: ${Number(v.used)}, limit: ${Number(v.limit)} }`,
      },
    };
  },
  presets: [
    {
      id: "default",
      title: "Default",
      note: "Files in context with per-file size and a remove affordance.",
      values: { files: SAMPLE, used: 18000, limit: 128000 },
    },
    {
      id: "full",
      title: "Nearly full",
      note: "As the window fills the usage bar turns amber, then red.",
      values: { files: SAMPLE, used: 121000, limit: 128000 },
    },
    {
      id: "empty",
      title: "Empty",
      note: "Before any attachment, point at the attach action instead of showing an empty box.",
      values: { files: "", used: 0, limit: 128000 },
    },
  ],
};

export function renderContextFiles(v: ControlValues, key: string) {
  return (
    <ContextFiles
      key={key}
      title={String(v.title)}
      files={parse(String(v.files))}
      usage={{ used: Number(v.used), limit: Number(v.limit) }}
      onRemove={() => {}}
    />
  );
}
