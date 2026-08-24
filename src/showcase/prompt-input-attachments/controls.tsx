"use client";

import * as React from "react";
import { PromptInputAttachments, type PendingFile } from "./prompt-input-attachments";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** `name | size | type | status | progress` per line. */
const DONE = [
  "screenshot.png | 1.2 MB | image | done | 100",
  "requirements.pdf | 340 KB | file | done | 100",
].join("\n");

const UPLOADING = [
  "research.pdf | 8.1 MB | file | uploading | 64",
  "demo.webm | 24 MB | file | uploading | 12",
].join("\n");

const ERRORED = [
  "archive.zip | 120 MB | file | error | 0",
  "designs.fig | 4.2 MB | file | done | 100",
].join("\n");

function parse(text: string): PendingFile[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [name, size, type, status, progress] = line.split("|").map((p) => p.trim());
      return {
        id: `f${i + 1}`,
        name,
        size,
        type: (type === "image" ? "image" : "file") as "image" | "file",
        status: status as PendingFile["status"],
        progress: Number(progress ?? 0),
      };
    });
}

export const promptInputAttachmentsControls: ComponentControls = {
  tag: "PromptInputAttachments",
  importFrom: "./prompt-input-attachments",
  controls: [
    {
      kind: "text",
      name: "files",
      label: "Files (name | size | type | status | progress)",
      value: DONE,
      multiline: true,
    },
    { kind: "text", name: "placeholder", label: "Placeholder", value: "Ask anything…" },
    { kind: "boolean", name: "disabled", label: "Disabled", value: false },
  ],
  handlers: ["onSubmit", "onAttach", "onRemove", "onRetry"],
  derive: (v) => {
    const files = parse(String(v.files));
    if (!files.length) return { props: { files: "[]" } };
    const body = files
      .map(
        (f) =>
          `  { id: ${JSON.stringify(f.id)}, name: ${JSON.stringify(f.name)}, size: ${JSON.stringify(f.size ?? "")}, type: ${JSON.stringify(f.type)}, status: ${JSON.stringify(f.status)}, progress: ${f.progress} },`,
      )
      .join("\n");
    return { preamble: `const FILES = [\n${body}\n];`, props: { files: "FILES" } };
  },
  presets: [
    {
      id: "default",
      title: "Attached",
      note: "Chips with type icons, sizes and one-click removal — the steady state.",
      values: { files: DONE, disabled: false },
    },
    {
      id: "uploading",
      title: "Uploading",
      note: "Per-file progress, so a long upload stays legible instead of looking stuck.",
      values: { files: UPLOADING, disabled: false },
    },
    {
      id: "error",
      title: "Upload error",
      note: "A failed chip stays visible with retry — the user never loses the file silently.",
      values: { files: ERRORED, disabled: false },
    },
  ],
};

/* Seeded from the controls and then owned locally, so the preview responds to
   clicks. Re-seeding is done by remounting on a key that includes the seed —
   the React way to reset state when an input changes — rather than a
   setState inside an effect. */
function LiveAttachments({ v }: { v: ControlValues }) {
  const [files, setFiles] = React.useState<PendingFile[]>(() => parse(String(v.files)));
  return (
    <PromptInputAttachments
      files={files}
      placeholder={String(v.placeholder)}
      disabled={Boolean(v.disabled)}
      onSubmit={() => {}}
      onAttach={() => {}}
      onRemove={(id) => setFiles((list) => list.filter((f) => f.id !== id))}
      onRetry={(id) =>
        setFiles((list) =>
          list.map((f) => (f.id === id ? { ...f, status: "done", progress: 100 } : f)),
        )
      }
    />
  );
}

export function renderPromptInputAttachments(v: ControlValues, key: string) {
  return <LiveAttachments key={`${key}:${v.files}`} v={v} />;
}
