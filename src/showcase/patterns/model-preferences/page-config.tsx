import type { PatternPageConfig } from "@/lib/pattern-page";
import { ModelPreferencesPattern } from "./model-preferences";

export const modelPreferencesPageConfig: PatternPageConfig = {
  sourceFile: "model-preferences.tsx",
  heroDemo: <ModelPreferencesPattern />,
  elements: [
    { label: "Model Selector", componentSlug: "model-selector" },
    { label: "Reasoning Level", componentSlug: "reasoning-level" },
    { label: "Tool Toggle", componentSlug: "tool-toggle" },
    { label: "Memory List", componentSlug: "memory-list" },
  ],
  usage: [
    "Group decisions that shape every answer — model, reasoning effort and tools — into one visible place, not buried in settings.",
    "Show the reasoning-level trade-off in words, not just a slider: tell the user what 'deep' will cost in latency.",
    "State what each tool is allowed to do next to its switch; a toggle without a permission boundary is a trap.",
    "Keep memory visible and removable next to the controls that depend on it — the user should see what the assistant holds.",
    "Persist these choices per conversation and per user; preferences that reset silently break trust.",
  ],
  mistakes: [
    "Spreading model, tools and memory across separate pages so the user cannot reason about them together.",
    "Letting the tool switches run without explaining the scope of each permission.",
    "Hiding saved memories behind a 'data' page — a user should not have to hunt to forget something.",
    "Adding a reasoning-level control that does not say how much slower 'deep' answers will be.",
  ],
};
