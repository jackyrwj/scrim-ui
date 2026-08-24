import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { modelSelectorControls, renderModelSelector } from "./controls";

export const modelSelectorPageConfig: ComponentPageConfig = {
  sourceFile: "model-selector.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: modelSelectorControls, render: renderModelSelector },
  usage: [
    "Show capability badges (reasoning, tools, speed) so users pick on substance, not name.",
    "Default to the model that best serves the current task, not the most powerful one.",
    "Remember the user's last choice — re-picking a model every session is friction.",
    "Label speed/cost trade-offs honestly; 'fast' next to a slow model destroys trust.",
  ],
  mistakes: [
    "Listing models with no hints — users choose blindly between identical-looking rows.",
    "Burying the selected model so the current choice is never visible.",
    "Making the dropdown unusable on mobile (too wide, tiny touch targets).",
  ],
};
