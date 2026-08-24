import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoExpanded } from "./demos";
import { reasoningStepsControls, renderReasoningSteps } from "./controls";

export const reasoningStepsPageConfig: ComponentPageConfig = {
  sourceFile: "reasoning-steps.tsx",
  heroDemo: <DemoExpanded />,
  explorer: { schema: reasoningStepsControls, render: renderReasoningSteps },
  usage: [
    "Show a step trace when the agent's work is a sequence the user can reason about — search, files, tools — not for a single undivided answer.",
    "Collapse the trace by default and let the header live-update; the summary is the status, the list is the detail.",
    "Color the running step subtly; the spinner and elapsed time carry the motion, not a flashing background.",
    "Keep steps short and verb-first ('Querying sources', not 'Source query process').",
  ],
  mistakes: [
    "Revealing every internal step — a trace is a promise of progress, not a license to dump the whole plan.",
    "Letting the trace jump around as steps resolve; stable ordering beats live re-sorting.",
    "Animation without an end state; when done, replace the spinner with a check so the trace reads finished.",
  ],
};
