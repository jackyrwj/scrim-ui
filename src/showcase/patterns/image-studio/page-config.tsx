import type { PatternPageConfig } from "@/lib/pattern-page";
import { ImageStudioPattern } from "./image-studio";

export const imageStudioPageConfig: PatternPageConfig = {
  sourceFile: "image-studio.tsx",
  heroDemo: <ImageStudioPattern />,
  elements: [
    { label: "Generated Media Result", componentSlug: "generated-media" },
    { label: "Prompt Input", componentSlug: "prompt-input" },
    { label: "Model Selector", componentSlug: "model-selector" },
  ],
  usage: [
    "Put the prompt in the feed the moment it's submitted — a queued card with a position beats a spinner over nothing.",
    "Stage generation in words and keep the card's shape fixed from queued to ready.",
    "Return variants per prompt and make switching between them cheap and reversible.",
    "Split blocked from failed: policy refusals ask for a rephrase, worker failures offer a retry that works.",
    "Keep every result's prompt one click from the composer — re-use is the core loop of a studio.",
  ],
  mistakes: [
    "A generation that vanishes into a global loading state, leaving the user nothing to read or cancel.",
    "Treating a safety block as an error with Retry — the retry will just be blocked again.",
    "New results replacing old ones instead of accumulating — a studio is a feed, not a lightbox.",
    "Params that live only in a tooltip; if the user can't compare two results' settings, variants are lottery tickets.",
  ],
};
