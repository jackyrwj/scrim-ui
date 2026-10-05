"use client";

import { Card } from "@/components/ui/card";
import * as React from "react";
import { withModelIcons } from "@/components/brands/brand-icon";
import { ModelSelector, type ModelOption } from "./model-selector";

// Real model names exercise the brand-mark resolution (see ModelIcon): each
// row carries its provider's mark, injected through the component's `icon`
// slot. Swap the names for whatever your own product actually offers.
const models: ModelOption[] = withModelIcons([
  {
    id: "claude",
    name: "Claude Sonnet 5",
    hint: "Balanced speed and reasoning",
    badges: ["Default"],
  },
  {
    id: "gpt",
    name: "GPT-5.6 Sol",
    hint: "Multimodal, fast",
    badges: ["Popular"],
  },
  {
    id: "gemini",
    name: "Gemini 3.1 Pro",
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
    <Card className="gap-0 py-0 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Model</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Which model answers your messages</p>
        </div>
        <ModelSelector
          options={models}
          value={value}
          onSelect={setValue}
          className="w-44"
        />
      </div>
    </Card>
  );
}
