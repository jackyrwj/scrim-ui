"use client";

import * as React from "react";
import { withModelIcons } from "@/components/brands/brand-icon";
import { ModelSelector, type ModelOption } from "./model-selector";

// Real model names exercise the brand-mark resolution (see ModelIcon): each
// row carries its provider's mark, injected through the component's `icon`
// slot. Swap the names for whatever your own product actually offers.
const models: ModelOption[] = withModelIcons([
  {
    id: "claude",
    name: "Claude Sonnet 4",
    hint: "Balanced speed and reasoning",
    badges: ["Default"],
  },
  {
    id: "gpt",
    name: "GPT-4o",
    hint: "Multimodal, fast",
    badges: ["Popular"],
  },
  {
    id: "gemini",
    name: "Gemini 2.5 Pro",
    hint: "1M token context",
    badges: [],
  },
  {
    id: "deepseek",
    name: "DeepSeek-V4-Pro",
    hint: "Lowest cost per token",
    badges: ["Cheap"],
  },
]);

export function DemoDefault() {
  const [value, setValue] = React.useState("claude");
  return <ModelSelector options={models} value={value} onSelect={setValue} />;
}

export function DemoOpen() {
  return <ModelSelector options={models} value="gpt" defaultOpen />;
}

export function DemoSettings() {
  const [value, setValue] = React.useState("atlas");
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Model</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Which model answers your messages</p>
        </div>
        <ModelSelector
          options={models}
          value={value}
          onSelect={setValue}
          className="w-44"
        />
      </div>
    </div>
  );
}
