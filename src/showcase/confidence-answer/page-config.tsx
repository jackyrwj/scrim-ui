import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoConfidence } from "./demos";
import { confidenceAnswerControls, renderConfidenceAnswer } from "./controls";

export const confidenceAnswerPageConfig: ComponentPageConfig = {
  sourceFile: "confidence-answer.tsx",
  heroDemo: <DemoConfidence />,
  explorer: { schema: confidenceAnswerControls, render: renderConfidenceAnswer },
  usage: [
    "Badge the uncertainty, not the certainty — a 'high confidence' mark on every solid answer trains the eye to skip the badge row entirely.",
    "Put the hedge at the claim: one sentence naming the specific thing that might be off — a number, a date, a version.",
    "Phrase levels as guidance on what to do next ('Worth double-checking'), not as a verdict on the model.",
    "Never show a bare percentage; '73% confident' borrows the vocabulary of measurement for a number that is not one.",
  ],
  mistakes: [
    "A blanket 'AI can make mistakes' footer — invisible by day two, and it tells the reader nothing about this answer.",
    "Badging every answer regardless of confidence, so the one reply that needed scrutiny gets it least.",
    "Hedging with vague worry ('this might be wrong') instead of saying what specifically to verify.",
  ],
};
