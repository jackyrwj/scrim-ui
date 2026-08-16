import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoFullDescriptions, DemoManyModels, DemoDisabled } from "./demos";

export const promptInputModelSelectorPageConfig: ComponentPageConfig = {
  sourceFile: "prompt-input-model-selector.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Default",
      note: "Model sits in its own bar above the input, with a capability hint. Switch models mid-compose freely.",
      demo: <DemoDefault />,
    },
    {
      id: "full-descriptions",
      title: "With descriptions",
      note: "Each option explains its trade-off so users pick deliberately, not by name recognition.",
      demo: <DemoFullDescriptions />,
    },
    {
      id: "many-models",
      title: "Many models",
      note: "Long menus stay scannable — name, one badge, one line of description.",
      demo: <DemoManyModels />,
    },
    {
      id: "disabled",
      title: "Disabled",
      note: "Model choice is gated behind sign-in; the composer itself stays visible.",
      demo: <DemoDisabled />,
    },
  ],
  usage: [
    "Put model choice where the prompt is composed, not in a settings page — users switch per message.",
    "Describe the trade-off, not just the brand — 'fast' vs 'most capable' is the real decision.",
    "Keep one badge per model; a list of six badges is indistinguishable from no badges.",
    "Persist the last-used model but never assume it — surface it clearly in the selector.",
    "Don't reload or lose the draft when switching models.",
  ],
  mistakes: [
    "Burying model selection in settings so users keep asking the wrong model.",
    "Showing only model names with no guidance — non-experts can't choose between 'Pro' and 'Ultra'.",
    "Resetting the composer when the model changes.",
    "Auto-switching models based on prompt content without telling the user.",
  ],
};
