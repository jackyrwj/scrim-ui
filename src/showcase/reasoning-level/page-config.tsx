import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoDeep, DemoCompact } from "./demos";

export const reasoningLevelPageConfig: ComponentPageConfig = {
  sourceFile: "reasoning-level.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Balanced",
      note: "A segmented control with a live caption explaining the current choice.",
      demo: <DemoDefault />,
    },
    {
      id: "deep",
      title: "Deep",
      note: "Deep reasoning is for hard problems — it should be the exception, not the default.",
      demo: <DemoDeep />,
    },
    {
      id: "compact",
      title: "Compact",
      note: "A tight version for popovers and side panels where vertical space is scarce.",
      demo: <DemoCompact />,
    },
  ],
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
