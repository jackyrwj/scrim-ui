"use client";

import * as React from "react";
import { AgentHandoff, type HandoffState } from "./agent-handoff";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const CARRIED = [
  "Issue #482 and its six comments",
  "The failing assertion in chunk.test.ts",
  "Repo conventions: no force-push, PRs need an issue link",
];

const WITHHELD = [
  "That the user already tried raising the chunk size and it did not help",
  "The earlier decision not to touch lib/retrieve.ts this week",
  "Two similar issues closed as won't-fix in March",
];

const RESULT =
  "chunk.ts now carries start/end through slice(). Tests pass. Also raised the default chunk size to 1200 — which the user had already tried, and which is not part of the fix.";

const PREAMBLE = `// withheld is the half worth rendering. Everything in this list is a way
// the receiving agent can confidently redo work that was already settled.
const withheld = contextDiff(parentContext, childContext);`;

export const agentHandoffControls: ComponentControls = {
  tag: "AgentHandoff",
  importFrom: "./agent-handoff",
  controls: [
    { kind: "text", name: "from", label: "From", value: "triage-agent" },
    { kind: "text", name: "to", label: "To", value: "patch-agent" },
    {
      kind: "enum",
      name: "state",
      label: "State",
      value: "accepted",
      options: [
        { value: "handing-off", label: "Handing off" },
        { value: "accepted", label: "Working" },
        { value: "returned", label: "Returned" },
        { value: "failed", label: "Failed" },
      ],
    },
    { kind: "boolean", name: "withheld", label: "Show what was not carried", value: true },
    { kind: "text", name: "reason", label: "Why this agent", value: "Reproduction is confirmed; writing the fix is a different toolset." },
  ],
  snippet: (v) => {
    const props = [
      `  from="${v.from}"`,
      `  to="${v.to}"`,
      String(v.reason).trim() ? `  reason="${v.reason}"` : null,
      "  task={task}",
      "  carried={carried}",
      v.withheld ? "  withheld={withheld}" : null,
      `  state="${v.state}"`,
      v.state === "returned" ? "  result={result}" : null,
    ].filter(Boolean);
    return `${PREAMBLE}\n\n<AgentHandoff\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "handing-off",
      title: "Handing off",
      note: "The task is written, the receiver has not started. Two context items carried and nothing flagged as missing yet.",
      values: { state: "handing-off", withheld: false, reason: "" },
    },
    {
      id: "working",
      title: "Working",
      note: "Three things were not carried across. Each one is a way the receiving agent can confidently redo work that was already settled.",
      values: { state: "accepted", withheld: true, reason: "Reproduction is confirmed; writing the fix is a different toolset." },
    },
    {
      id: "returned",
      title: "Returned",
      note: "It came back having raised the chunk size — which the user had already tried, and which was in the withheld list. That is what context loss looks like from the outside.",
      values: { state: "returned", withheld: true, reason: "Reproduction is confirmed; writing the fix is a different toolset." },
    },
  ],
};

export function renderAgentHandoff(v: ControlValues, key: string) {
  return (
    <AgentHandoff
      key={key}
      from={String(v.from)}
      to={String(v.to)}
      reason={String(v.reason).trim() === "" ? undefined : String(v.reason)}
      task="Fix the dropped chunk offsets in lib/chunk.ts and make chunk.test.ts pass. Do not open a PR."
      carried={v.state === "handing-off" ? CARRIED.slice(0, 2) : CARRIED}
      withheld={v.withheld ? WITHHELD : []}
      state={String(v.state) as HandoffState}
      result={v.state === "returned" ? RESULT : undefined}
    />
  );
}
