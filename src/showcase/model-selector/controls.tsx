"use client";

import * as React from "react";
import { withModelIcons } from "@/components/brands/brand-icon";
import { ModelSelector } from "./model-selector";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** `id | name | hint | badge,badge` per line. Real model names so the
 * preview exercises the provider-mark resolution; unrecognized names simply
 * render with no mark. */
const MODELS = [
  "claude | Claude Sonnet 4 | Balanced speed and reasoning | Default",
  "gpt | GPT-4o | Multimodal, fast | Popular",
  "gemini | Gemini 2.5 Pro | 1M token context |",
  "deepseek | DeepSeek-V4-Pro | Lowest cost per token | Cheap",
].join("\n");

function parse(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, name, hint, badges] = line.split("|").map((p) => p.trim());
      return {
        id,
        name,
        hint: hint ?? "",
        badges: badges ? badges.split(",").map((b) => b.trim()).filter(Boolean) : undefined,
      };
    });
}

export const modelSelectorControls: ComponentControls = {
  tag: "ModelSelector",
  importFrom: "./model-selector",
  controls: [
    { kind: "text", name: "options", label: "Models (id | name | hint | badges)", value: MODELS, multiline: true },
    { kind: "text", name: "value", label: "Selected id", value: "claude" },
    { kind: "text", name: "placeholder", label: "Placeholder", value: "Choose a model" },
    { kind: "boolean", name: "defaultOpen", label: "Open by default", value: false },
  ],
  handlers: ["onSelect"],
  derive: (v) => {
    const body = parse(String(v.options))
      .map(
        (o) =>
          `  { id: ${JSON.stringify(o.id)}, name: ${JSON.stringify(o.name)}, hint: ${JSON.stringify(o.hint)}${o.badges ? `, badges: ${JSON.stringify(o.badges)}` : ""} },`,
      )
      .join("\n");
    return { preamble: `const MODELS = [\n${body}\n];`, props: { options: "MODELS" } };
  },
  presets: [
    {
      id: "default",
      title: "Closed",
      note: "The resting state — current model and its headline badge.",
      values: { defaultOpen: false, value: "claude" },
    },
    {
      id: "open",
      title: "Expanded",
      note: "Each option carries a name, a one-line hint and capability badges.",
      values: { defaultOpen: true, value: "claude" },
    },
  ],
  remountOn: ["defaultOpen"],
};

/* Seeded from the controls and then owned locally, so the preview responds to
   clicks. Re-seeding is done by remounting on a key that includes the seed —
   the React way to reset state when an input changes — rather than a
   setState inside an effect. */
function LiveModelSelector({ v }: { v: ControlValues }) {
  const [value, setValue] = React.useState(String(v.value));
  return (
    <ModelSelector
      options={withModelIcons(parse(String(v.options)))}
      value={value}
      placeholder={String(v.placeholder)}
      defaultOpen={Boolean(v.defaultOpen)}
      onSelect={setValue}
    />
  );
}

export function renderModelSelector(v: ControlValues, key: string) {
  return <LiveModelSelector key={`${key}:${v.value}`} v={v} />;
}
