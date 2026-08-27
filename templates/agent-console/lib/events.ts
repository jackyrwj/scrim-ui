import type { Usage } from "./cost";

/**
 * The run's event log.
 *
 * This file is the seam the whole template turns on, so it is worth being
 * blunt about why it exists.
 *
 * A run has to survive a page reload. That is not a nice-to-have: an agent
 * that pauses for human approval can sit waiting for minutes, and in minutes
 * a person closes a laptop, switches tabs, or loses a train tunnel's worth of
 * signal. If the run's state lives in React, all of that destroys it. So the
 * server owns the state, and what the client gets is this: an **append-only
 * log of numbered events**.
 *
 * Append-only buys three things that are otherwise separate features:
 *
 *  - **Resume.** Reconnecting means "send me everything after seq N". The SSE
 *    endpoint replays from the log and then subscribes. No snapshot diffing,
 *    no lost updates in the gap between the two.
 *  - **Two tabs.** Both replay the same log and reduce to the same UI, and a
 *    decision made in one appears in the other because it goes through the
 *    server.
 *  - **Re-run a step.** Instead of deleting history — which would renumber
 *    events under a client mid-replay — a re-run appends a `rewind` event.
 *    The reducer drops steps at or after the mark; the log stays immutable.
 *    See lib/run-store.ts.
 *
 * Everything in here is JSON and client-safe. lib/run-store.ts and
 * lib/runner.ts are server-only and never imported from a component.
 */

export type RunStatus =
  /** The model is working. */
  | "running"
  /** Stopped at a tool that needs a person to say yes. Resumable. */
  | "awaiting-approval"
  | "completed"
  | "failed"
  /** The user cancelled. The model request was actually aborted. */
  | "cancelled";

export type ToolCallRecord = {
  toolCallId: string;
  toolName: string;
  input: unknown;
};

export type RunEvent =
  | { type: "run-started"; goal: string; model: string; at: number }
  | { type: "status"; status: RunStatus; error?: string }
  | { type: "step-started"; step: number; at: number }
  | { type: "step-finished"; step: number; usage: Usage; ms: number }
  | { type: "text-delta"; step: number; text: string }
  | { type: "reasoning-delta"; step: number; text: string }
  | ({ type: "tool-call"; step: number } & ToolCallRecord)
  | { type: "tool-result"; step: number; toolCallId: string; output: unknown }
  | { type: "tool-error"; step: number; toolCallId: string; errorText: string }
  | ({ type: "approval-requested"; step: number; approvalId: string } & ToolCallRecord)
  | { type: "approval-responded"; step: number; approvalId: string; approved: boolean; reason?: string }
  | { type: "tool-denied"; step: number; toolCallId: string }
  /** Everything from `step` onwards is being re-run; drop it and listen again. */
  | { type: "rewind"; step: number };

/** An event as it leaves the server: the log's index travels with it. */
export type SequencedEvent = { seq: number; event: RunEvent };

/* ------------------------------------------------------------------ */
/* The client-side projection                                          */
/* ------------------------------------------------------------------ */

/**
 * What a reducer over the log produces. The UI renders this and nothing else,
 * which is why the same code paints a live run and a reloaded one — a replay
 * is not a special case, it is the only case.
 */

export type StepToolCall = ToolCallRecord & {
  state: "running" | "success" | "error" | "denied" | "awaiting-approval";
  output?: unknown;
  errorText?: string;
  approvalId?: string;
};

export type Step = {
  index: number;
  startedAt: number;
  ms?: number;
  text: string;
  reasoning: string;
  toolCalls: StepToolCall[];
  usage?: Usage;
};

export type RunView = {
  goal: string;
  model: string;
  status: RunStatus;
  error?: string;
  startedAt: number;
  steps: Step[];
  /** Approval ids still waiting on a person, in the order they arrived. */
  pending: string[];
};

export const EMPTY_RUN: RunView = {
  goal: "",
  model: "",
  status: "running",
  error: undefined,
  startedAt: 0,
  steps: [],
  pending: [],
};

function stepAt(run: RunView, index: number): { run: RunView; step: Step } {
  const existing = run.steps.find((s) => s.index === index);
  if (existing) return { run, step: existing };
  const step: Step = { index, startedAt: Date.now(), text: "", reasoning: "", toolCalls: [] };
  return { run: { ...run, steps: [...run.steps, step] }, step };
}

/** Replaces one step, keeping the array's identity discipline for React. */
function patch(run: RunView, index: number, change: (step: Step) => Step): RunView {
  const { run: withStep } = stepAt(run, index);
  return {
    ...withStep,
    steps: withStep.steps.map((s) => (s.index === index ? change(s) : s)),
  };
}

function patchCall(step: Step, toolCallId: string, change: (call: StepToolCall) => StepToolCall): Step {
  return { ...step, toolCalls: step.toolCalls.map((c) => (c.toolCallId === toolCallId ? change(c) : c)) };
}

/**
 * The reducer.
 *
 * Pure, exported, and used by both the live stream and the replay — if you
 * only test one thing in this template, test this against a recorded log.
 */
export function reduceRun(run: RunView, event: RunEvent): RunView {
  switch (event.type) {
    case "run-started":
      return { ...run, goal: event.goal, model: event.model, startedAt: event.at };

    case "status":
      return { ...run, status: event.status, error: event.error };

    case "step-started":
      return patch(run, event.step, (s) => ({ ...s, startedAt: event.at }));

    case "step-finished":
      return patch(run, event.step, (s) => ({ ...s, usage: event.usage, ms: event.ms }));

    case "text-delta":
      return patch(run, event.step, (s) => ({ ...s, text: s.text + event.text }));

    case "reasoning-delta":
      return patch(run, event.step, (s) => ({ ...s, reasoning: s.reasoning + event.text }));

    case "tool-call":
      return patch(run, event.step, (s) =>
        s.toolCalls.some((c) => c.toolCallId === event.toolCallId)
          ? patchCall(s, event.toolCallId, (c) => ({ ...c, state: "running", input: event.input }))
          : {
              ...s,
              toolCalls: [
                ...s.toolCalls,
                { toolCallId: event.toolCallId, toolName: event.toolName, input: event.input, state: "running" },
              ],
            },
      );

    case "tool-result":
      return patch(run, event.step, (s) =>
        patchCall(s, event.toolCallId, (c) => ({ ...c, state: "success", output: event.output })),
      );

    case "tool-error":
      return patch(run, event.step, (s) =>
        patchCall(s, event.toolCallId, (c) => ({ ...c, state: "error", errorText: event.errorText })),
      );

    case "tool-denied":
      return patch(run, event.step, (s) => patchCall(s, event.toolCallId, (c) => ({ ...c, state: "denied" })));

    case "approval-requested": {
      const next = patch(run, event.step, (s) => ({
        ...s,
        toolCalls: s.toolCalls.some((c) => c.toolCallId === event.toolCallId)
          ? s.toolCalls.map((c) =>
              c.toolCallId === event.toolCallId
                ? { ...c, state: "awaiting-approval" as const, approvalId: event.approvalId }
                : c,
            )
          : [
              ...s.toolCalls,
              {
                toolCallId: event.toolCallId,
                toolName: event.toolName,
                input: event.input,
                state: "awaiting-approval" as const,
                approvalId: event.approvalId,
              },
            ],
      }));
      return { ...next, pending: [...next.pending, event.approvalId] };
    }

    case "approval-responded": {
      const next = patch(run, event.step, (s) => ({
        ...s,
        toolCalls: s.toolCalls.map((c) =>
          c.approvalId === event.approvalId
            ? { ...c, state: event.approved ? ("running" as const) : ("denied" as const) }
            : c,
        ),
      }));
      return { ...next, pending: next.pending.filter((id) => id !== event.approvalId) };
    }

    case "rewind":
      /* The re-run case. Steps at or after the mark are gone; the events that
         built them stay in the log, which is what lets a client that was
         offline for the whole thing replay to the same place. */
      return {
        ...run,
        steps: run.steps.filter((s) => s.index < event.step),
        pending: [],
        error: undefined,
      };
  }
}

export function replay(events: RunEvent[], from: RunView = EMPTY_RUN): RunView {
  return events.reduce(reduceRun, from);
}
