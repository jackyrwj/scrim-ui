import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoSuggestion } from "./demos";
import { memorySuggestionControls, renderMemorySuggestion } from "./controls";

export const memorySuggestionPageConfig: ComponentPageConfig = {
  sourceFile: "memory-suggestion.tsx",
  heroDemo: <DemoSuggestion />,
  explorer: { schema: memorySuggestionControls, render: renderMemorySuggestion },
  usage: [
    "Propose a save only for durable, useful facts — not transient details of the conversation.",
    "Always make the save explicit with Save / Not now; never silently store.",
    "Show the exact fact being saved so the user can judge before agreeing.",
    "Offer Undo after saving — a memory a user regrets is worse than none.",
  ],
  mistakes: [
    "Saving facts silently — the user discovers the assistant 'remembers' things it was never told to keep.",
    "Proposing to remember trivial, one-off details, which trains users to dismiss every suggestion.",
    "Saving sensitive facts (finances, health, contacts) without a stronger confirmation.",
  ],
};
