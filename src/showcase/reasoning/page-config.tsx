import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoThinking, DemoComplete, DemoCollapsed, DemoCoding } from "./demos";

export const reasoningPageConfig: ComponentPageConfig = {
  sourceFile: "reasoning.tsx",
  heroDemo: <DemoThinking />,
  variants: [
    {
      id: "thinking",
      title: "Thinking",
      note: "A live elapsed timer and spinner signal active reasoning. 'Stop reasoning' lets the user interrupt.",
      demo: <DemoThinking />,
    },
    {
      id: "complete",
      title: "Complete",
      note: "Steps render as a numbered timeline with a completion confirmation. Fully open for inspection.",
      demo: <DemoComplete />,
    },
    {
      id: "collapsed",
      title: "Collapsed",
      note: "The trace collapses to a single line — keep it compact once the user has moved on.",
      demo: <DemoCollapsed />,
    },
    {
      id: "coding",
      title: "Coding trace",
      note: "Reasoning traces adapt per domain — here the steps read like a debugging log.",
      demo: <DemoCoding />,
    },
  ],
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
