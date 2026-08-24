import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoThinking } from "./demos";
import { reasoningControls, renderReasoning } from "./controls";

export const reasoningPageConfig: ComponentPageConfig = {
  sourceFile: "reasoning.tsx",
  heroDemo: <DemoThinking />,
  explorer: { schema: reasoningControls, render: renderReasoning },
  usage: [
    "Show the trace as it happens — a blank pause during 'thinking' reads as a hang or a failure.",
    "Keep each step one line when possible; expand details on demand.",
    "Elapsed time gives users confidence something is progressing. Always show it for long traces.",
    "Collapse by default once complete so the answer leads the conversation.",
    "Allow interruption — reasoning can take tens of seconds.",
  ],
  mistakes: [
    "Hiding the reasoning entirely. Users of reasoning models expect to see the thinking.",
    "Letting steps grow unbounded with huge wall-of-text details.",
    "Auto-scrolling the page as steps stream in — anchor only when the user is already there.",
    "Using a flashy animation that distracts from the actual content of the trace.",
  ],
};
