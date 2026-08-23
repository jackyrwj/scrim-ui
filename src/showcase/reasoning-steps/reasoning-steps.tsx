"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ReasoningStepsProps = {
  /** Each step's short label, in order. */
  steps: string[];
  /** Index of the step currently running — earlier steps render as done, later ones as pending. */
  activeStep?: number;
  /** Time spent on the active step, shown next to it (e.g. "3.2s"). */
  elapsed?: string;
  defaultExpanded?: boolean;
  title?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ReasoningSteps                                                      */
/* ------------------------------------------------------------------ */

export function ReasoningSteps({
  steps,
  activeStep = -1,
  elapsed,
  defaultExpanded = true,
  title = "Reasoning",
  className = "",
}: ReasoningStepsProps) {
  const [open, setOpen] = React.useState(defaultExpanded);
  const doneCount = steps.filter((_, i) => i < activeStep).length;

  return (
    <div className={`overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 bg-zinc-50 px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" className="text-zinc-500 dark:text-zinc-400">
          <path d="M9.18 9.5a3 3 0 0 0 2.42 4.73" />
          <path d="M12 2a10 10 0 1 0 10 10" />
          <path d="M12 6v4l3 2" />
        </svg>
        <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{title}</span>
        {activeStep >= 0 && activeStep < steps.length ? (
          <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
            Step {activeStep + 1} of {steps.length}
            {elapsed && ` · ${elapsed}`}
          </span>
        ) : (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {doneCount} {doneCount === 1 ? "step" : "steps"} · {steps.length} total
          </span>
        )}
        <span className="ml-auto text-zinc-400 dark:text-zinc-500">
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <ol className="border-t border-zinc-200 p-2 dark:border-zinc-800">
          {steps.map((step, i) => {
            const state = i < activeStep ? "done" : i === activeStep ? "active" : "pending";
            return (
              <li
                key={step}
                className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 ${
                  state === "active" ? "bg-zinc-100 dark:bg-zinc-800/80" : ""
                }`}
              >
                <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center">
                  {state === "done" && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                      <CheckIcon />
                    </span>
                  )}
                  {state === "active" && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
                  )}
                  {state === "pending" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  )}
                </span>
                <span
                  className={`text-[13px] leading-5 ${
                    state === "done"
                      ? "text-zinc-600 dark:text-zinc-300"
                      : state === "active"
                        ? "font-medium text-zinc-800 dark:text-zinc-100"
                        : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
