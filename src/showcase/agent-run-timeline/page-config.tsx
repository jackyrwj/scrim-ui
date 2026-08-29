import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { agentRunTimelineControls, renderAgentRunTimeline } from "./controls";

export const agentRunTimelinePageConfig: ComponentPageConfig = {
  sourceFile: "agent-run-timeline.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: agentRunTimelineControls, render: renderAgentRunTimeline },
  usage: [
    "Give every event a stable id — a retry appends a new linked event and never overwrites the failed original.",
    "Collapse consecutive successes into countable clusters; waiting, running, failed and approvals never fold.",
    "Follow new events only while the reader is at the bottom — otherwise offer a 'back to latest' pill.",
    "Keep approval gates visually distinct and actionable in place; they're the only events that can spend or change.",
    "Attach tokens, time and cost as a summary so a long run is accountable, not just long.",
  ],
  mistakes: [
    "Auto-scrolling on every new event — anyone reading step 12 of 80 gets yanked to the tail forever.",
    "A flat list where 60 identical tool calls drown the one failed lookup and the pending approval.",
    "Retrying by mutating the failed row — the log stops being a record and starts being a dashboard.",
    "Treating a cancelled run as an error — red everywhere teaches the reader to ignore red.",
  ],
};
