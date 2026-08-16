import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoOpen, DemoSettings } from "./demos";

export const modelSelectorPageConfig: ComponentPageConfig = {
  sourceFile: "model-selector.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Default",
      note: "A real model picker — choose a model and the list updates and closes.",
      demo: <DemoDefault />,
    },
    {
      id: "open",
      title: "Expanded",
      note: "Each option shows a name, a one-line hint and capability badges so the choice is informed.",
      demo: <DemoOpen />,
    },
    {
      id: "settings",
      title: "Settings row",
      note: "The same picker embedded in a settings row, next to its label.",
      demo: <DemoSettings />,
    },
  ],
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
