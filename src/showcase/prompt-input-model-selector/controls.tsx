"use client";

import { PromptInputModelSelector, type ModelOption } from "./prompt-input-model-selector";
import { withModelIcons } from "@/components/brands/brand-icon";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** `id | name | badge | description` per line. */
const CLAUDE = [
  "claude-opus-5 | Claude Opus 5 | Reasoning | Strongest reasoning for complex tasks.",
  "claude-sonnet-5 | Claude Sonnet 5 | Balanced | Best mix of speed and quality for daily work.",
  "claude-haiku-4.5 | Claude Haiku 4.5 | Fast | Lowest latency for quick, simple answers.",
  "claude-fable-5 | Claude Fable 5 | Advanced | Most capable generally available model.",
].join("\n");

const MANY = [
  CLAUDE,
  "gpt-5.6 | GPT-5.6 Sol | Fast | Broad tooling support.",
  "gemini-3.1 | Gemini 3.1 Pro | Long context | Very large context window.",
  "llama-4 | Llama 4 | Open | Self-hostable open weights.",
  "deepseek-v4 | DeepSeek V4 | Cheap | Lowest cost per token.",
].join("\n");

function parse(text: string): ModelOption[] {
  return withModelIcons(
    text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [id, name, badge, description] = line.split("|").map((p) => p.trim());
        return { id, name, badges: badge ? [badge] : undefined, description };
      }),
  );
}

export const promptInputModelSelectorControls: ComponentControls = {
  tag: "PromptInputModelSelector",
  importFrom: "./prompt-input-model-selector",
  controls: [
    { kind: "text", name: "models", label: "Models (id | name | badge | description)", value: CLAUDE, multiline: true },
    { kind: "text", name: "defaultModel", label: "Default model id", value: "claude-sonnet-5" },
    { kind: "text", name: "placeholder", label: "Placeholder", value: "Ask anything…" },
    { kind: "boolean", name: "disabled", label: "Disabled", value: false },
  ],
  handlers: ["onSubmit", "onChange"],
  derive: (v) => {
    const body = parse(String(v.models))
      .map(
        (m) =>
          `  { id: ${JSON.stringify(m.id)}, name: ${JSON.stringify(m.name)}, badges: ${JSON.stringify(m.badges ?? [])}, description: ${JSON.stringify(m.description ?? "")} },`,
      )
      .join("\n");
    return { preamble: `const MODELS = [\n${body}\n];`, props: { models: "MODELS" } };
  },
  presets: [
    {
      id: "default",
      title: "Default",
      note: "The model sits in its own bar above the input, with a capability hint.",
      values: { models: CLAUDE, disabled: false },
    },
    {
      id: "many-models",
      title: "Many models",
      note: "Long menus stay scannable — name, one badge, one line of description.",
      values: { models: MANY, disabled: false },
    },
    {
      id: "disabled",
      title: "Disabled",
      note: "Model choice gated behind sign-in; the composer itself stays visible.",
      values: { models: CLAUDE, disabled: true },
    },
  ],
  remountOn: ["defaultModel"],
};

export function renderPromptInputModelSelector(v: ControlValues, key: string) {
  return (
    <PromptInputModelSelector
      key={key}
      models={parse(String(v.models))}
      defaultModel={String(v.defaultModel)}
      placeholder={String(v.placeholder)}
      disabled={Boolean(v.disabled)}
      onSubmit={() => {}}
      onChange={() => {}}
    />
  );
}
