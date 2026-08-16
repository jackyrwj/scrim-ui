import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoDisabled } from "./demos";

export const toolTogglePageConfig: ComponentPageConfig = {
  sourceFile: "tool-toggle.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Default",
      note: "Live switches for the assistant's tools — flip them and the state updates.",
      demo: <DemoDefault />,
    },
    {
      id: "disabled",
      title: "Locked tool",
      note: "A tool gated behind a plan is shown but dimmed, so the upgrade path is discoverable.",
      demo: <DemoDisabled />,
    },
  ],
  usage: [
    "Describe each tool's permission in plain language — 'can read files' beats a tool name.",
    "Default tools on when they are safe and clearly benefit the user's goal.",
    "Show locked tools as disabled with a reason, not hidden — it motivates the upgrade.",
    "Announce what a toggle change means in the next response (web search on → answers cite sources).",
  ],
  mistakes: [
    "Generic tool names with no idea what the tool can actually access.",
    "Toggles with no visible consequence — the assistant ignores them or never says it used a tool.",
    "Offering an 'allow everything' master switch that nullifies granular controls.",
  ],
};
