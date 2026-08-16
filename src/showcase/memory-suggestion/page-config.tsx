import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoSuggestion, DemoSaved } from "./demos";

export const memorySuggestionPageConfig: ComponentPageConfig = {
  sourceFile: "memory-suggestion.tsx",
  heroDemo: <DemoSuggestion />,
  variants: [
    {
      id: "suggestion",
      title: "Suggestion",
      note: "The assistant proposes saving a fact. Ask before you store — the user keeps control.",
      demo: <DemoSuggestion />,
    },
    {
      id: "saved",
      title: "Saved",
      note: "Confirmation after saving, with an Undo path so a wrong save is never permanent.",
      demo: <DemoSaved />,
    },
  ],
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
