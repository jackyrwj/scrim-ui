"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ReasoningStep = {
  title: string;
  detail?: string;
};

export type ReasoningProps = {
  steps?: ReasoningStep[];
  isThinking?: boolean;
  elapsed?: string;
  onStop?: () => void;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4h3Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44A2.5 2.5 0 0 0 20 17.5v-11A2.5 2.5 0 0 0 17.5 4h-3Z" />
      <path d="M12 5v1M12 18v1" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function StopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Reasoning                                                           */
/* ------------------------------------------------------------------ */

export function Reasoning({
  steps = [],
  isThinking = false,
  elapsed,
  onStop,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  className = "",
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
          <BrainIcon />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {isThinking ? "Reasoning" : "Reasoning trace"}
        </span>
        {elapsed && <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{elapsed}</span>}
        {isThinking && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
            <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
            Thinking
          </span>
        )}
        <span className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronIcon />
        </span>
      </button>

      {/* Steps */}
      {open && (
        <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          {steps.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <span>Formulating an approach…</span>
            </div>
          ) : (
            <ol className="relative space-y-3 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
              {steps.map((step, i) => (
                <li key={i} className="relative pl-6">
                  <span className="absolute left-0 top-1 flex h-[15px] w-[15px] items-center justify-center rounded-full border border-zinc-200 bg-white text-[9px] text-zinc-500 dark:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{step.title}</p>
                  {step.detail && (
                    <p className="mt-0.5 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
                      {step.detail}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}

          {isThinking && onStop && (
            <button
              type="button"
              onClick={onStop}
              className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <StopIcon />
              Stop reasoning
            </button>
          )}
          {!isThinking && steps.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckIcon />
              Reasoning complete — {steps.length} step{steps.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
