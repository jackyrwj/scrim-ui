import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { reasoningLevelControls, renderReasoningLevel } from "./controls";

export const reasoningLevelPageConfig: ComponentPageConfig = {
  sourceFile: "reasoning-level.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: reasoningLevelControls, render: renderReasoningLevel },
  usage: [
    "Name levels by outcome (Light / Balanced / Deep), not internal parameter names.",
    "Explain the current level in plain words — what will the model do differently?",
    "Default to the middle option; deep reasoning costs time and money.",
    "Make the control keyboard accessible with arrow-key movement.",
  ],
  mistakes: [
    "Exposing raw numbers or internal API terms the user has to decode.",
    "No feedback on what changed — switching to Deep and seeing no effect feels broken.",
    "Letting deep reasoning run silently on every message, burning latency and credits.",
  ],
};
