"use client";

import * as React from "react";
import { PromptEditor } from "./prompt-editor";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const VARIABLES = ["product", "audience", "tone", "limit"];

const PREVIEW_VALUES: Record<string, string> = {
  product: "Scrim UI",
  audience: "a senior frontend engineer",
  tone: "direct",
  limit: "120",
};

const PREVIOUS_VERSION =
  "You are the docs writer for {{product}}.\n\nAnswer for {{audience}}. Keep it short.";

const TYPO_TEMPLATE = "Write the release notes for {{product}} aimed at {{audienc}}.";

export const promptEditorControls: ComponentControls = {
  tag: "PromptEditor",
  importFrom: "./prompt-editor",
  controls: [
    { kind: "text", name: "template", label: "Template", value: "You are the docs writer for {{product}}.\n\nAnswer for {{audience}} in a {{tone}} tone, under {{limit}} words.", multiline: true },
    { kind: "boolean", name: "typo", label: "Include an unknown variable", value: false },
    { kind: "boolean", name: "preview", label: "With preview values", value: true },
    { kind: "boolean", name: "diff", label: "Compare with previous version", value: false },
    { kind: "number", name: "rows", label: "Rows", value: 6, min: 3, max: 14, step: 1 },
  ],
  snippet: (v) => {
    const templateText = v.typo ? TYPO_TEMPLATE : String(v.template);
    const literal = "`" + templateText.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

    const preamble = [
      `// The variables this deployment actually fills. Anything else matching\n// {{...}} gets the warning tint and is left as-is by renderTemplate.\nconst variables = ${JSON.stringify(VARIABLES)};`,
      `const [template, setTemplate] = React.useState(${literal});`,
      v.preview ? `const previewValues = ${JSON.stringify(PREVIEW_VALUES, null, 2)};` : null,
      v.diff ? `const previousVersion = ${JSON.stringify(PREVIOUS_VERSION)};` : null,
    ].filter(Boolean);

    const props = [
      "  value={template}",
      "  onChange={setTemplate}",
      "  variables={variables}",
      v.preview ? "  previewValues={previewValues}" : null,
      v.diff ? "  compareWith={previousVersion}" : null,
      Number(v.rows) !== 6 ? `  rows={${v.rows}}` : null,
    ].filter(Boolean);

    return `${preamble.join("\n\n")}\n\n<PromptEditor\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "editing",
      title: "Editing",
      note: "Known variables in green, a Write/Preview toggle, and a live count. The default shape.",
      values: { typo: false, preview: true, diff: false, rows: 6 },
    },
    {
      id: "typo",
      title: "A typo'd variable",
      note: "{{audienc}} is not in the list — amber tint, a warning line, and the placeholder survives preview instead of vanishing.",
      values: { typo: true, preview: true, diff: false, rows: 4 },
    },
    {
      id: "versioned",
      title: "Against a previous version",
      note: "compareWith renders a line diff of what this edit changed — the thing a prompt review actually needs to see.",
      values: { typo: false, preview: true, diff: true, rows: 6 },
    },
    {
      id: "bare",
      title: "Editor only",
      note: "No preview values, no diff — just the highlighting, which is the part that is on in every configuration.",
      values: { typo: false, preview: false, diff: false, rows: 6 },
    },
  ],
};

export function renderPromptEditor(v: ControlValues, key: string) {
  return <PromptEditorHarness key={key} v={v} />;
}

/* The editor is controlled, so the harness holds the state — the Explorer's
   template control is the initial value, and edits inside the preview work.
   The prev-comparison resets that state when the control changes. */
function PromptEditorHarness({ v }: { v: ControlValues }) {
  const initial = v.typo ? TYPO_TEMPLATE : String(v.template);
  const [value, setValue] = React.useState(initial);
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setValue(initial);
  }

  return (
    <PromptEditor
      value={value}
      onChange={setValue}
      variables={VARIABLES}
      rows={Math.max(3, Number(v.rows))}
      previewValues={v.preview ? PREVIEW_VALUES : undefined}
      compareWith={v.diff ? PREVIOUS_VERSION : undefined}
    />
  );
}
