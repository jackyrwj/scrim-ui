"use client";

import * as React from "react";
import { PromptInput, type Attachment, type ModelOption } from "./prompt-input";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** `name | size | type` per line. */
const ATTACHMENTS = ["screenshot.png | 1.2 MB | image", "spec.pdf | 340 KB | file"].join("\n");

/** `id | name | hint` per line. */
const MODELS = [
  "atlas | Atlas | Flagship — best for complex reasoning",
  "nova | Nova | Balanced speed and quality",
  "pulse | Pulse | Fast and cheap for simple tasks",
].join("\n");

function parseAttachments(text: string): Attachment[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [name, size, type] = line.split("|").map((p) => p.trim());
      return { id: `a${i + 1}`, name, size, type: (type === "image" ? "image" : "file") as "image" | "file" };
    });
}

function parseModels(text: string): ModelOption[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, name, hint] = line.split("|").map((p) => p.trim());
      return { id, name, hint };
    });
}

export const promptInputControls: ComponentControls = {
  tag: "PromptInput",
  importFrom: "./prompt-input",
  controls: [
    { kind: "text", name: "placeholder", label: "Placeholder", value: "Ask anything…" },
    { kind: "text", name: "attachments", label: "Attachments (name | size | type)", value: "", multiline: true },
    { kind: "text", name: "models", label: "Models (id | name | hint)", value: "", multiline: true },
    { kind: "text", name: "defaultModel", label: "Default model id", value: "nova" },
    { kind: "text", name: "error", label: "Error", value: "" },
    { kind: "boolean", name: "loading", label: "Loading", value: false },
    { kind: "boolean", name: "disabled", label: "Disabled", value: false },
    { kind: "boolean", name: "showWebSearch", label: "Web search button", value: true },
    { kind: "boolean", name: "showTools", label: "Tools button", value: true },
  ],
  handlers: ["onSubmit", "onAttach", "onRemoveAttachment", "onVoice", "onStop"],
  derive: (v) => {
    const props: Record<string, string> = {};
    const parts: string[] = [];
    const files = parseAttachments(String(v.attachments));
    if (files.length) {
      parts.push(
        `const ATTACHMENTS = [\n${files
          .map(
            (f) =>
              `  { id: ${JSON.stringify(f.id)}, name: ${JSON.stringify(f.name)}, size: ${JSON.stringify(f.size ?? "")}, type: ${JSON.stringify(f.type)} },`,
          )
          .join("\n")}\n];`,
      );
      props.attachments = "ATTACHMENTS";
    }
    const models = parseModels(String(v.models));
    if (models.length) {
      parts.push(
        `const MODELS = [\n${models
          .map(
            (m) =>
              `  { id: ${JSON.stringify(m.id)}, name: ${JSON.stringify(m.name)}, hint: ${JSON.stringify(m.hint ?? "")} },`,
          )
          .join("\n")}\n];`,
      );
      props.models = "MODELS";
    }
    return { preamble: parts.join("\n\n") || undefined, props };
  },
  presets: [
    {
      id: "default",
      title: "Default",
      note: "Enter to send, Shift+Enter for a newline; send activates once there is text.",
      values: { attachments: "", models: "", error: "", loading: false, disabled: false },
    },
    {
      id: "with-attachments",
      title: "Attachments",
      note: "Chips with type icons, size and one-click removal.",
      values: { attachments: ATTACHMENTS, models: "", error: "", loading: false, disabled: false },
    },
    {
      id: "with-model-selector",
      title: "Model selector",
      note: "Inline picker with capability hints; closes on Escape or an outside click.",
      values: { attachments: "", models: MODELS, error: "", loading: false, disabled: false },
    },
    {
      id: "loading",
      title: "Loading",
      note: "The send button becomes Stop while a response generates.",
      values: { attachments: "", models: "", error: "", loading: true, disabled: false },
    },
    {
      id: "error",
      title: "Error",
      note: "Failures surface under the input with a red border — the text is never lost.",
      values: {
        attachments: "",
        models: "",
        error: "Message failed to send. Check your connection and try again.",
        loading: false,
        disabled: false,
      },
    },
    {
      id: "disabled",
      title: "Disabled",
      note: "For logged-out or read-only states; every control is inert.",
      values: { attachments: "", models: "", error: "", loading: false, disabled: true },
    },
  ],
  remountOn: ["defaultModel"],
};

/* Seeded from the controls and then owned locally, so the preview responds to
   clicks. Re-seeding is done by remounting on a key that includes the seed —
   the React way to reset state when an input changes — rather than a
   setState inside an effect. */
function LivePromptInput({ v }: { v: ControlValues }) {
  const [files, setFiles] = React.useState<Attachment[]>(() => parseAttachments(String(v.attachments)));
  const models = parseModels(String(v.models));
  return (
    <PromptInput
      placeholder={String(v.placeholder)}
      attachments={files}
      models={models.length ? models : undefined}
      defaultModel={String(v.defaultModel)}
      error={v.error ? String(v.error) : null}
      loading={Boolean(v.loading)}
      disabled={Boolean(v.disabled)}
      showWebSearch={Boolean(v.showWebSearch)}
      showTools={Boolean(v.showTools)}
      onSubmit={() => {}}
      onAttach={() => {}}
      onRemoveAttachment={(id) => setFiles((list) => list.filter((f) => f.id !== id))}
      onVoice={() => {}}
      onStop={() => {}}
    />
  );
}

export function renderPromptInput(v: ControlValues, key: string) {
  return <LivePromptInput key={`${key}:${v.attachments}`} v={v} />;
}
