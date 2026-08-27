"use client";

import * as React from "react";
import type { Step, StepToolCall } from "@/lib/events";
import { costOf, formatCost, formatTokens, totalTokens } from "@/lib/cost";
import { ToolCall } from "./ui/tool-call";
import { ApprovalRequest } from "./ui/approval-request";

/**
 * One step in the timeline.
 *
 * Collapsed by default once it is finished, and that is the design rather
 * than a nicety. A forty-step run rendered open is a wall nobody reads; the
 * one thing a person actually wants from step 14 is "what did it do and did
 * it work", which is the header. The body is for when the answer is
 * interesting.
 *
 * Three exceptions stay open, because each is a step the reader is being
 * asked to do something about:
 *
 *  - the step still running,
 *  - a step that failed,
 *  - a step waiting on an approval.
 */

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

/** "what the step did", in one line, for the collapsed header. */
function summarise(step: Step): string {
  if (step.toolCalls.length > 0) {
    const names = [...new Set(step.toolCalls.map((c) => c.toolName))];
    return names.join(", ");
  }
  const text = step.text.trim();
  if (!text) return "Thinking";
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

function toolStatus(state: StepToolCall["state"]): "running" | "success" | "error" {
  if (state === "success") return "success";
  if (state === "error" || state === "denied") return "error";
  return "running";
}

export function StepCard({
  step,
  model,
  live,
  awaitingApproval,
  failed,
  busyApproval,
  onApprove,
  onRerun,
}: {
  step: Step;
  model: string;
  /** True for the step currently being generated. */
  live: boolean;
  awaitingApproval: boolean;
  failed: boolean;
  busyApproval: string | null;
  onApprove: (approvalId: string, approved: boolean) => void;
  onRerun: (step: number) => void;
}) {
  const forcedOpen = live || awaitingApproval || failed;

  /* Opens when the step becomes one of the three that demand attention, and
     does NOT close again when it stops being one — a step that just finished
     under the reader's eyes should not collapse out from under them, and a
     reader who deliberately collapsed a finished step should not have it
     spring open again.
     The previous value is kept in state and compared during render rather
     than watched in an effect: an effect would paint the step closed for one
     frame before opening it, which is a flicker on the one card the reader
     was told to look at. */
  const [open, setOpen] = React.useState(forcedOpen);
  const [wasForced, setWasForced] = React.useState(forcedOpen);
  if (forcedOpen !== wasForced) {
    setWasForced(forcedOpen);
    if (forcedOpen) setOpen(true);
  }

  const usage = step.usage ?? {};
  const cost = costOf(model, usage);
  const tokens = totalTokens(usage);

  return (
    <li className="relative pl-8">
      {/* Rail and node. The line is drawn by the list, not the item, so it
          does not break between steps. */}
      <span
        className={`absolute left-[9px] top-3.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-950 ${
          failed
            ? "bg-red-500"
            : awaitingApproval
              ? "bg-amber-500"
              : live
                ? "animate-pulse bg-blue-500"
                : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      />

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {String(step.index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-700 dark:text-zinc-300">
            {summarise(step)}
          </span>

          {/* Per-step spend. Nothing is shown until the numbers exist —
              "$0.0000" for a step still in flight is a number that is about
              to be wrong, which is worse than a gap. */}
          {step.usage && (
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {formatTokens(tokens)} · {formatCost(cost)}
            </span>
          )}
          {step.ms !== undefined && (
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {(step.ms / 1000).toFixed(1)}s
            </span>
          )}

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="space-y-3 border-t border-zinc-100 px-3.5 py-3 dark:border-zinc-800">
            {step.reasoning && (
              <details className="text-[13px]">
                <summary className="cursor-pointer text-zinc-400 dark:text-zinc-500">Reasoning</summary>
                <p className="mt-1.5 whitespace-pre-wrap leading-6 text-zinc-500 dark:text-zinc-400">
                  {step.reasoning}
                </p>
              </details>
            )}

            {step.text && (
              <p className="whitespace-pre-wrap text-[14px] leading-6 text-zinc-700 dark:text-zinc-300">
                {step.text}
                {live && (
                  <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
                )}
              </p>
            )}

            {step.toolCalls.map((call) =>
              call.state === "awaiting-approval" && call.approvalId ? (
                <ApprovalRequest
                  key={call.toolCallId}
                  title={`Run ${call.toolName}`}
                  requester="The agent"
                  description="This step is paused until you decide. The run resumes on its own afterwards — you can close this tab in the meantime."
                  detail={formatValue(call.input)}
                  busy={busyApproval === call.approvalId}
                  note="Nothing happens until you choose"
                  onAllow={() => onApprove(call.approvalId!, true)}
                  onDeny={() => onApprove(call.approvalId!, false)}
                />
              ) : (
                <ToolCall
                  key={call.toolCallId}
                  name={call.toolName}
                  status={toolStatus(call.state)}
                  input={formatValue(call.input)}
                  output={
                    call.state === "denied"
                      ? "Denied. The agent was told the call was not approved."
                      : call.state === "error"
                        ? call.errorText
                        : call.state === "success"
                          ? formatValue(call.output)
                          : undefined
                  }
                />
              ),
            )}

            {/* Re-running is offered on finished steps only. Offering it on a
                live one would mean cancelling and rewinding in a single
                click, which is two decisions wearing one button. */}
            {!live && (
              <div className="flex items-center gap-3 pt-0.5">
                <button
                  type="button"
                  onClick={() => onRerun(step.index)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  Re-run from here
                </button>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Discards this step and everything after it
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
