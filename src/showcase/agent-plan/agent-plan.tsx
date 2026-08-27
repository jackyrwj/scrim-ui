"use client";

import * as React from "react";

/**
 * The checklist an agent writes for itself, and then edits while you watch.
 *
 * A static list of steps is a five-minute component. What makes this one
 * worth its own file is that **the plan changes mid-run**, and every naive
 * rendering of that change is worse than not showing the plan at all:
 *
 * **Completed steps must never move.** The model re-emits its plan and the
 * new list is not the old list — a step was inserted at position two, another
 * was dropped. Rendering the new array wholesale slides everything the reader
 * has already read to a new position, and they lose their place in a list
 * they were using precisely to keep it. So finished steps hold their order,
 * and new work arrives underneath.
 *
 * **A dropped step is not a deleted step.** Something the agent said it would
 * do and then decided not to is the most interesting line in the plan. It
 * becomes `skipped`, with the reason, rather than vanishing — a plan that
 * silently loses items is a plan you cannot audit afterwards.
 *
 * **A newly added step should announce itself.** `added` marks work that was
 * not in the original plan, because "the agent decided to do three more
 * things" is a fact the reader wants before it finishes doing them.
 *
 * **A revision counter, not a diff.** Full before/after diffing of a plan is
 * a lot of machinery for a reader who mostly wants to know *that* it changed.
 * `revision` says how many times, and the per-step marks say where.
 */

export type PlanStepState = "pending" | "active" | "done" | "skipped" | "failed";

export type PlanStep = {
  id: string;
  text: string;
  state: PlanStepState;
  /** Why it was skipped, or what it produced. One line. */
  note?: string;
  /** True for a step the agent added after the first plan. */
  added?: boolean;
};

export type AgentPlanProps = {
  steps: PlanStep[];
  /** 0 = the original plan. Anything higher is shown next to the title. */
  revision?: number;
  /** The plan itself is still being written. */
  planning?: boolean;
  title?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Step marks                                                          */
/* ------------------------------------------------------------------ */

function Mark({ state }: { state: PlanStepState }) {
  const base = "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border";
  switch (state) {
    case "done":
      return (
        <span className={`${base} border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" width="9" height="9">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      );
    case "active":
      return (
        <span className={`${base} border-blue-500 text-blue-500`}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
        </span>
      );
    case "failed":
      return (
        <span className={`${base} border-red-500 bg-red-500 text-white`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" width="9" height="9">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
      );
    case "skipped":
      return (
        <span className={`${base} border-zinc-300 text-zinc-400 dark:border-zinc-600 dark:text-zinc-500`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" width="9" height="9">
            <path d="M5 12h14" />
          </svg>
        </span>
      );
    default:
      return <span className={`${base} border-zinc-300 dark:border-zinc-600`} />;
  }
}

/* ------------------------------------------------------------------ */
/* AgentPlan                                                           */
/* ------------------------------------------------------------------ */

export function AgentPlan({
  steps,
  revision = 0,
  planning = false,
  title = "Plan",
  className = "",
}: AgentPlanProps) {
  const done = steps.filter((s) => s.state === "done").length;
  const settled = steps.filter((s) => s.state !== "pending" && s.state !== "active").length;

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-zinc-100 px-3.5 py-2.5 dark:border-zinc-800">
        <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{title}</span>
        <span className="tabular-nums text-[11px] text-zinc-500 dark:text-zinc-400">
          {done}/{steps.length} done
        </span>
        {revision > 0 && (
          /* The reader's mental model of "the plan" is now out of date, and
             saying so costs one word. */
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            revised {revision}×
          </span>
        )}
        {planning && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            still planning
          </span>
        )}
      </div>

      <ol className="px-3.5 py-3">
        {steps.map((step, i) => (
          <li key={step.id} className="relative flex gap-2.5 pb-3 last:pb-0">
            {/* Rail, drawn between marks rather than behind them, so a
                skipped step reads as part of the sequence it was cut from. */}
            {i < steps.length - 1 && (
              <span className="absolute left-2 top-5 h-[calc(100%-1.25rem)] w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
            )}
            <Mark state={step.state} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  className={`text-[13px] leading-5 ${
                    step.state === "skipped"
                      ? "text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-600"
                      : step.state === "done"
                        ? "text-zinc-500 dark:text-zinc-400"
                        : "text-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  {step.text}
                </span>
                {step.added && (
                  <span className="shrink-0 rounded-md bg-blue-100 px-1.5 py-px text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    added
                  </span>
                )}
              </div>
              {step.note && (
                <p className="mt-0.5 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
                  {step.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {settled > 0 && settled === steps.length && (
        <p className="border-t border-zinc-100 px-3.5 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Plan complete — {done} done, {steps.length - done} skipped or failed.
        </p>
      )}
    </div>
  );
}
