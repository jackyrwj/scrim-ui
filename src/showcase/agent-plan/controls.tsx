"use client";

import * as React from "react";
import { AgentPlan, type PlanStep } from "./agent-plan";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const RUNNING: PlanStep[] = [
  { id: "1", text: "Search open issues for reports of dropped citations", state: "done", note: "6 issues, 2 recent" },
  { id: "2", text: "Read lib/chunk.ts and lib/retrieve.ts", state: "done" },
  { id: "3", text: "Check whether offsets survive the streaming path", state: "active", added: true, note: "not in the original plan — the two files disagreed" },
  { id: "4", text: "Write a failing test", state: "pending" },
  { id: "5", text: "Post a comment on issue #482", state: "pending" },
];

const REVISED: PlanStep[] = [
  { id: "1", text: "Search open issues for reports of dropped citations", state: "done", note: "6 issues, 2 recent" },
  { id: "2", text: "Read lib/chunk.ts and lib/retrieve.ts", state: "done" },
  { id: "3", text: "Check whether offsets survive the streaming path", state: "done", added: true },
  { id: "4", text: "Write a failing test", state: "done", note: "chunk.test.ts — fails on the slice invariant" },
  { id: "6", text: "Open a pull request", state: "skipped", added: true, note: "skipped — the repo requires an issue link and #482 is not assigned" },
  { id: "5", text: "Post a comment on issue #482", state: "done" },
];

const PLANNING: PlanStep[] = [
  { id: "1", text: "Search open issues for reports of dropped citations", state: "pending" },
  { id: "2", text: "Read lib/chunk.ts and lib/retrieve.ts", state: "pending" },
];

const SETS: Record<string, PlanStep[]> = { planning: PLANNING, running: RUNNING, revised: REVISED };

export const agentPlanControls: ComponentControls = {
  tag: "AgentPlan",
  importFrom: "./agent-plan",
  controls: [
    {
      kind: "enum",
      name: "phase",
      label: "Where the run is",
      value: "running",
      options: [
        { value: "planning", label: "Writing the plan" },
        { value: "running", label: "Mid-run" },
        { value: "revised", label: "Finished, twice revised" },
      ],
    },
    { kind: "number", name: "revision", label: "Times revised", value: 1, min: 0, max: 9, step: 1 },
    { kind: "text", name: "title", label: "Title", value: "Plan" },
  ],
  snippet: (v) => {
    const props = [
      "  steps={STEPS}",
      Number(v.revision) > 0 ? `  revision={${v.revision}}` : null,
      v.phase === "planning" ? "  planning" : null,
      v.title !== "Plan" ? `  title="${v.title}"` : null,
    ].filter(Boolean);
    return `// A step the agent dropped becomes state: "skipped" with a reason.\n// It never disappears — a plan that loses items cannot be audited.\nconst STEPS = plan.steps;\n\n<AgentPlan\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "planning",
      title: "Writing the plan",
      note: "Two steps so far and more coming. The list is short because it is unfinished, not because the task is small — the header says which.",
      values: { phase: "planning", revision: 0, title: "Plan" },
    },
    {
      id: "running",
      title: "Mid-run",
      note: "Step three was added after the first plan and says so. Three more things the agent decided to do is worth knowing before it does them.",
      values: { phase: "running", revision: 1, title: "Plan" },
    },
    {
      id: "revised",
      title: "Finished, revised twice",
      note: "A step was added and then skipped, with the reason kept. Deleting it would have left a plan that ran cleanly and a run that did not.",
      values: { phase: "revised", revision: 2, title: "Plan" },
    },
  ],
};

export function renderAgentPlan(v: ControlValues, key: string) {
  return (
    <AgentPlan
      key={key}
      steps={SETS[String(v.phase)] ?? RUNNING}
      revision={Number(v.revision)}
      planning={v.phase === "planning"}
      title={String(v.title)}
    />
  );
}
