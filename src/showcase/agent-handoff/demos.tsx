"use client";

import * as React from "react";
import { AgentHandoff } from "./agent-handoff";

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

export function DemoDefault() {
  return (
    <AgentHandoff
      from="triage-agent"
      to="patch-agent"
      reason="Reproduction is confirmed; writing the fix is a different toolset."
      task="Fix the dropped chunk offsets in lib/chunk.ts and make chunk.test.ts pass. Do not open a PR."
      carried={CARRIED}
      withheld={WITHHELD}
      state="accepted"
    />
  );
}

export function DemoReturned() {
  return (
    <AgentHandoff
      from="triage-agent"
      to="patch-agent"
      reason="Reproduction is confirmed; writing the fix is a different toolset."
      task="Fix the dropped chunk offsets in lib/chunk.ts and make chunk.test.ts pass. Do not open a PR."
      carried={CARRIED}
      withheld={WITHHELD}
      state="returned"
      result="chunk.ts now carries start/end through slice(). Tests pass. Also raised the default chunk size to 1200 — which the user had already tried, and which is not part of the fix."
    />
  );
}

export function DemoHandingOff() {
  return (
    <AgentHandoff
      from="triage-agent"
      to="patch-agent"
      task="Fix the dropped chunk offsets in lib/chunk.ts and make chunk.test.ts pass."
      carried={CARRIED.slice(0, 2)}
      state="handing-off"
    />
  );
}
