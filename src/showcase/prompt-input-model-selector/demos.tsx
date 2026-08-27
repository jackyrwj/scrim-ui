"use client";

import * as React from "react";
import { PromptInputModelSelector, type ModelOption } from "./prompt-input-model-selector";
import { withModelIcons } from "@/components/brands/brand-icon";

const MODELS: ModelOption[] = withModelIcons([
  {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    badges: ["Reasoning"],
    description: "Strongest reasoning for complex tasks.",
  },
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    badges: ["Balanced"],
    description: "Best mix of speed and quality for daily work.",
  },
  {
    id: "claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    badges: ["Fast"],
    description: "Lowest latency for quick, simple answers.",
  },
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    badges: ["Advanced"],
    description: "Most capable generally available model.",
  },
]);

export function DemoDefault() {
  return <PromptInputModelSelector models={MODELS} defaultModel="claude-sonnet-5" onSubmit={() => {}} />;
}

export function DemoFullDescriptions() {
  return <PromptInputModelSelector models={MODELS} defaultModel="claude-fable-5" onSubmit={() => {}} />;
}

export function DemoManyModels() {
  return (
    <PromptInputModelSelector
      models={[
        ...withModelIcons([
          { id: "gpt-5.6", name: "GPT-5.6 Sol", badges: ["Fast"], description: "Broad tooling support." },
          { id: "gemini-3.1", name: "Gemini 3.1 Pro", badges: ["Long context"], description: "Very large context window." },
          { id: "llama-4", name: "Llama 4", badges: ["Open"], description: "Self-hostable open weights." },
          { id: "deepseek-v4", name: "DeepSeek V4", badges: ["Cheap"], description: "Lowest cost per token." },
        ]),
        ...MODELS,
      ]}
      defaultModel="deepseek-v4"
      onSubmit={() => {}}
    />
  );
}

export function DemoDisabled() {
  return (
    <PromptInputModelSelector
      models={MODELS}
      defaultModel="claude-sonnet-5"
      disabled
      placeholder="Sign in to choose a model…"
      onSubmit={() => {}}
    />
  );
}
