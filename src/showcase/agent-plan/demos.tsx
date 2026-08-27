"use client";

import * as React from "react";
import { AgentPlan, type PlanStep } from "./agent-plan";

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

export function DemoDefault() {
  return <AgentPlan steps={RUNNING} revision={1} />;
}

export function DemoPlanning() {
  return <AgentPlan steps={PLANNING} planning />;
}

export function DemoRevised() {
  return <AgentPlan steps={REVISED} revision={2} />;
}
