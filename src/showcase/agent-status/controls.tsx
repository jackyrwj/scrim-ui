"use client";

import { AgentStatus, type AgentState } from "./agent-status";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const agentStatusControls: ComponentControls = {
  tag: "AgentStatus",
  importFrom: "./agent-status",
  controls: [
    { kind: "text", name: "name", label: "Agent name", value: "Research Agent" },
    {
      kind: "enum",
      name: "status",
      label: "Status",
      value: "running",
      options: [
        { value: "running", label: "Running" },
        { value: "waiting", label: "Waiting" },
        { value: "completed", label: "Completed" },
        { value: "failed", label: "Failed" },
      ],
    },
    {
      kind: "text",
      name: "action",
      label: "Current action",
      value: "Searching 12 sources for recent AI model releases…",
      multiline: true,
    },
    { kind: "number", name: "progress", label: "Progress", value: 42, min: 0, max: 100 },
    { kind: "text", name: "elapsed", label: "Elapsed", value: "8s" },
  ],
  handlers: ["onStop", "onRetry"],
  presets: [
    {
      id: "running",
      title: "Running",
      note: "Progress bar, elapsed time and a stop control; the action line names the current step.",
      values: { status: "running", progress: 42, elapsed: "8s" },
    },
    {
      id: "waiting",
      title: "Waiting",
      note: "Amber — the agent is paused on a human decision or an external dependency.",
      values: {
        status: "waiting",
        action: "Awaiting your approval before sending the report",
        progress: 0,
        elapsed: "4.2s",
      },
    },
    {
      id: "completed",
      title: "Completed",
      note: "Green confirmation with a summary of what the agent actually did.",
      values: {
        status: "completed",
        action: "Report ready — 12 sources, 3 findings",
        progress: 100,
        elapsed: "28.4s",
      },
    },
    {
      id: "failed",
      title: "Failed",
      note: "Red, with the failing step named and a one-click retry.",
      values: {
        name: "Deploy Agent",
        status: "failed",
        action: "Preview build failed at step 3 of 5",
        progress: 0,
        elapsed: "11.2s",
      },
    },
  ],
  // The old "Multi-agent view" variant stacked three of these. It was a
  // composition, not a set of props, so it has no place in a prop explorer;
  // the point it made now lives in the usage notes below the fold.
  remountOn: ["status"],
};

export function renderAgentStatus(v: ControlValues, key: string) {
  return (
    <AgentStatus
      key={key}
      name={String(v.name)}
      status={v.status as AgentState}
      action={String(v.action)}
      progress={Number(v.progress)}
      elapsed={String(v.elapsed)}
      onStop={() => {}}
      onRetry={() => {}}
    />
  );
}
