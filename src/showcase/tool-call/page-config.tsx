import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoRunning, DemoSuccess, DemoError, DemoStack } from "./demos";

export const toolCallPageConfig: ComponentPageConfig = {
  sourceFile: "tool-call.tsx",
  heroDemo: <DemoRunning />,
  variants: [
    {
      id: "running",
      title: "Running",
      note: "Spinner, elapsed time, and a cancel affordance. The tool row reads as active without demanding attention.",
      demo: <DemoRunning />,
    },
    {
      id: "success",
      title: "Completed",
      note: "Green status pill. The input/output payload is collapsible and open by default for inspection.",
      demo: <DemoSuccess />,
    },
    {
      id: "error",
      title: "Failed",
      note: "Red accent on border, icon and pill. The output surfaces the error message for debugging.",
      demo: <DemoError />,
    },
    {
      id: "stack",
      title: "Sequence",
      note: "Multiple tools in an agent turn — statuses transition as the run progresses.",
      demo: <DemoStack />,
    },
  ],
  usage: [
    "Show a tool call immediately when the tool starts — before the result arrives. Silence reads as a hang.",
    "Keep the payload collapsed by default for completed calls; expand for inspection. Never hide failures.",
    "Always show elapsed time on long-running tools; users estimate progress from it.",
    "Prefer truncated tool names with a full label on hover — tool names can get very long.",
    "Color only the status, not the whole row — too many red/green rows become noise.",
  ],
  mistakes: [
    "Hiding tool calls from the user entirely — agents that 'magically' get data destroy trust.",
    "Rendering raw tool output in huge pre blocks. Collapse by default and cap the height.",
    "Forgetting cancel for long-running tools, forcing the user to kill the whole session.",
    "Swapping status colors mid-animation — users attach meaning to position before color.",
  ],
};
