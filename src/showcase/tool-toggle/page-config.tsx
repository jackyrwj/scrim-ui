import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { toolToggleControls, renderToolToggle } from "./controls";

export const toolTogglePageConfig: ComponentPageConfig = {
  sourceFile: "tool-toggle.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: toolToggleControls, render: renderToolToggle },
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
