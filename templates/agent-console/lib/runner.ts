import { isStepCount, streamText, type ModelMessage, type ToolApprovalConfiguration, type ToolApprovalResponse } from "ai";
import { APPROVAL, tools } from "./tools";
import { appendEvent, clearController, getRun, setController, setStatus, type Run } from "./run-store";

/**
 * Driving a run forward.
 *
 * The shape here is the one decision the whole template rests on: **one
 * `streamText` call per step**, in a loop this file owns, rather than one
 * call with `stopWhen: isStepCount(40)`.
 *
 * The multi-step version is shorter and it is what most examples do. It also
 * makes three of the four things a run console exists for impossible:
 *
 *  - **Per-step boundaries.** Re-running step 3 means truncating the
 *    conversation to exactly where step 3 began. Inside one long call there
 *    is no point where you can take that measurement.
 *  - **Per-step usage.** Token totals arrive per call. Attributing them to a
 *    step afterwards is guesswork, and a cost meter built on guesswork is a
 *    support ticket (see lib/cost.ts).
 *  - **Stopping between steps.** Cancellation, an approval gate, and a step
 *    ceiling are all "check something, then decide whether to continue", and
 *    that check needs a place to happen.
 *
 * The cost of the loop is one extra provider round trip's worth of
 * bookkeeping per step, which is nothing next to the model call it wraps.
 *
 * A step, precisely: one model turn plus whatever tools it called. That is
 * also what the timeline draws, which is not a coincidence — the unit the
 * user sees and the unit the runner resumes from should be the same thing,
 * or "re-run this step" points at something the reader cannot see.
 */

/** Ceiling, not a target. It exists to end a loop, not to encourage one. */
const MAX_STEPS = 40;

const SYSTEM = [
  "You are an agent working on a software team's issue tracker.",
  "Work in small steps. Before any action that other people can see, say in one sentence what you are about to do and why.",
  "When a tool call is not approved, do not retry it — explain what you would have done and continue with what is left.",
  "When a tool returns nothing, say so plainly rather than guessing.",
  "Stop as soon as the goal is met, and finish with a short summary of what you did.",
].join(" ");

/** One run at a time, per run. Two overlapping turns would interleave their
 *  messages and produce a conversation the model cannot read. */
const active = new Set<string>();

export function isActive(runId: string): boolean {
  return active.has(runId);
}

/**
 * Runs steps until the run stops, needs a person, or hits the ceiling.
 *
 * Deliberately NOT awaited by the routes that call it. An HTTP request that
 * starts a run should return as soon as the run exists — the client is
 * already subscribed to the event stream and will see the steps arrive.
 * Awaiting it here is how a "start run" POST ends up timing out at 30s on a
 * platform limit halfway through step 6.
 */
export async function advance(runId: string): Promise<void> {
  if (active.has(runId)) return;
  const run = getRun(runId);
  if (!run) return;

  active.add(runId);
  try {
    setStatus(runId, "running");

    while (run.step < MAX_STEPS) {
      const stopped = await runStep(run);
      if (stopped) return;
    }

    setStatus(runId, "failed", `Stopped after ${MAX_STEPS} steps without finishing.`);
  } catch (error) {
    /* An abort is a decision, not a failure. cancelRun already set the
       status; overwriting it with "failed" would tell the user their own
       Stop button broke something. */
    if (isAbort(error)) return;
    console.error("[run]", runId, error);
    setStatus(runId, "failed", readableError(error));
  } finally {
    active.delete(runId);
    clearController(runId);
  }
}

/** @returns true when the loop should stop (done, waiting, or cancelled). */
async function runStep(run: Run): Promise<boolean> {
  const step = run.step;

  /* The boundary, taken before anything is appended. This single number is
     what makes "re-run step N" mean something. */
  run.boundaries[step] = run.messages.length;
  appendEvent(run.id, { type: "step-started", step, at: Date.now() });

  const controller = new AbortController();
  setController(run.id, controller);
  const startedAt = Date.now();

  const result = streamText({
    model: run.model,
    system: SYSTEM,
    messages: run.messages,
    tools,
    toolApproval: APPROVAL as ToolApprovalConfiguration<typeof tools, never>,
    /* Signs each approval request so a client cannot forge one. Without it,
       the approval a browser sends back is just a claim: the conversation is
       rebuilt from client-supplied messages on every turn, so a crafted
       history can walk straight past the gate the user was meant to see.
       Optional here because the tools are stubs; not optional the moment one
       of them spends money. */
    experimental_toolApprovalSecret: process.env.TOOL_APPROVAL_SECRET,
    abortSignal: controller.signal,
    /* One model turn. The loop above is the multi-step part. */
    stopWhen: isStepCount(1),
    onError: ({ error }) => {
      console.error("[step]", run.id, step, error);
    },
  });

  let sawApproval = false;

  for await (const part of result.stream) {
    switch (part.type) {
      case "text-delta":
        appendEvent(run.id, { type: "text-delta", step, text: part.text });
        break;

      case "reasoning-delta":
        appendEvent(run.id, { type: "reasoning-delta", step, text: part.text });
        break;

      case "tool-call":
        appendEvent(run.id, {
          type: "tool-call",
          step,
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          input: part.input,
        });
        break;

      case "tool-result":
        appendEvent(run.id, {
          type: "tool-result",
          step,
          toolCallId: part.toolCallId,
          output: part.output,
        });
        break;

      case "tool-error":
        appendEvent(run.id, {
          type: "tool-error",
          step,
          toolCallId: part.toolCallId,
          errorText: readableError(part.error),
        });
        break;

      case "tool-output-denied":
        appendEvent(run.id, { type: "tool-denied", step, toolCallId: part.toolCallId });
        break;

      case "tool-approval-request":
        /* The pause. The SDK emitted this INSTEAD of executing the tool, and
           nothing else will happen on this run until a matching response is
           appended to the conversation. `isAutomatic` marks approvals the
           policy already decided — those are recorded, not asked about. */
        if (!part.isAutomatic) {
          sawApproval = true;
          run.pending.set(part.approvalId, { step, toolCallId: part.toolCall.toolCallId });
          appendEvent(run.id, {
            type: "approval-requested",
            step,
            approvalId: part.approvalId,
            toolCallId: part.toolCall.toolCallId,
            toolName: part.toolCall.toolName,
            input: part.toolCall.input,
          });
        }
        break;

      case "finish-step":
        appendEvent(run.id, {
          type: "step-finished",
          step,
          ms: Date.now() - startedAt,
          usage: {
            inputTokens: part.usage.inputTokens,
            cachedInputTokens: part.usage.inputTokenDetails?.cacheReadTokens,
            outputTokens: part.usage.outputTokens,
            reasoningTokens: part.usage.outputTokenDetails?.reasoningTokens,
          },
        });
        break;

      default:
        /* text-start, tool-input-delta, raw, and the rest. The console draws
           steps, not chunks, so most of the stream is noise here. */
        break;
    }
  }

  /* The model's own record of the step, appended in full. This — not the
     event log — is what the next step is generated from. Keeping the two
     separate is what lets the UI change without changing what the model
     sees, and vice versa. */
  run.messages.push(...(await result.responseMessages));
  run.step = step + 1;

  if (controller.signal.aborted) return true;

  if (sawApproval) {
    setStatus(run.id, "awaiting-approval");
    return true;
  }

  const finishReason = await result.finishReason;
  if (finishReason !== "tool-calls") {
    setStatus(run.id, "completed");
    return true;
  }

  return false;
}

/* ------------------------------------------------------------------ */
/* Approvals                                                           */
/* ------------------------------------------------------------------ */

/**
 * Record a decision and, when nothing else is outstanding, carry on.
 *
 * The response goes into the conversation as a tool message. That is the
 * whole resume mechanism: the next `streamText` call sees an approved call
 * and executes it, or sees a denied one and has to talk its way around it.
 *
 * Returns false when the approval id is unknown — which is the ordinary case,
 * not an edge case. A second tab, a double-click, a back button, or a
 * refresh mid-decision all produce a response for an approval that has
 * already been answered. Treat it as a no-op and let the client re-read the
 * log rather than erroring at someone for clicking twice.
 */
export function respondToApproval(
  runId: string,
  approvalId: string,
  approved: boolean,
  reason?: string,
): boolean {
  const run = getRun(runId);
  if (!run) return false;
  const pending = run.pending.get(approvalId);
  if (!pending) return false;

  run.pending.delete(approvalId);

  const response: ToolApprovalResponse = {
    type: "tool-approval-response",
    approvalId,
    approved,
    ...(reason ? { reason } : {}),
  };
  const message: ModelMessage = { role: "tool", content: [response] };
  run.messages.push(message);

  appendEvent(runId, {
    type: "approval-responded",
    step: pending.step,
    approvalId,
    approved,
    reason,
  });

  /* More than one tool can be waiting in the same step — a model that calls
     two write tools in one turn raises two gates. Resuming after the first
     answer would run the second one unapproved. */
  if (run.pending.size === 0) void advance(runId);
  return true;
}

/* ------------------------------------------------------------------ */
/* Errors                                                             */
/* ------------------------------------------------------------------ */

function isAbort(error: unknown): boolean {
  return (
    (error instanceof Error && (error.name === "AbortError" || /abort/i.test(error.message))) ||
    (typeof error === "object" && error !== null && "name" in error && error.name === "AbortError")
  );
}

/**
 * What the user is shown. Log the real error; hand back something that says
 * what to do next without leaking provider internals.
 */
function readableError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/rate.?limit|429/i.test(message)) return "The model is rate limited. Wait a moment, then retry the step.";
  if (/context.?length|too many tokens/i.test(message))
    return "The conversation outgrew the model's context window. Start a new run with a narrower goal.";
  return message || "The step failed.";
}
