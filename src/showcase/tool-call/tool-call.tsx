"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ToolStatus = "running" | "success" | "error";

export type ToolCallProps = {
  name: string;
  input?: string;
  output?: string;
  status?: ToolStatus;
  duration?: string;
  icon?: React.ReactNode;
  onCancel?: () => void;
  defaultOpen?: boolean;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function TerminalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="m4 17 6-6-6-6M12 19h8" />
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

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
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

/* ------------------------------------------------------------------ */
/* Status pill                                                         */
/* ------------------------------------------------------------------ */

function StatusPill({ status, onCancel }: { status: ToolStatus; onCancel?: () => void }) {
  if (status === "running") {
    return (
      <button
        type="button"
        onClick={onCancel}
        disabled={!onCancel}
        title="Cancel"
        /* min-h-6: py-0.5 on 11px text left a 20.5px-tall tap target, under the
           24x24 minimum. The pill's look is unchanged at this size. */
        className="inline-flex min-h-6 items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 transition-colors hover:bg-zinc-200 disabled:hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:disabled:hover:bg-zinc-800"
      >
        <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
        Running
        {onCancel && (
          <span className="text-zinc-400">
            <StopIcon />
          </span>
        )}
      </button>
    );
  }
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
        <CheckIcon />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-700 dark:bg-red-900/40 dark:text-red-400">
      <XIcon />
      Failed
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* ToolCall                                                            */
/* ------------------------------------------------------------------ */

export function ToolCall({
  name,
  input,
  output,
  status = "running",
  duration,
  icon,
  onCancel,
  defaultOpen = status !== "running",
  className = "",
}: ToolCallProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const hasDetails = (input?.length ?? 0) > 0 || (output?.length ?? 0) > 0;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-900 ${
        status === "error"
          ? "border-red-200 dark:border-red-900/60"
          : status === "running"
            ? "border-zinc-300 dark:border-zinc-700"
            : ""
      } ${className}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => hasDetails && setOpen((v) => !v)}
        aria-expanded={open}
        disabled={!hasDetails}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            status === "error"
              ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
              : status === "running"
                ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          }`}
        >
          {icon ?? <TerminalIcon />}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {name}
        </span>
        {duration && <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{duration}</span>}
        <span className="shrink-0">
          <StatusPill status={status} onCancel={onCancel} />
        </span>
        {hasDetails && (
          <span
            className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <ChevronIcon />
          </span>
        )}
      </button>

      {/* Details */}
      {open && hasDetails && (
        <div className="space-y-2 border-t border-zinc-100 px-3.5 py-3 dark:border-zinc-800">
          {input && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Input
              </span>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-50 p-2.5 font-mono text-xs leading-5 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
                {input}
              </pre>
            </div>
          )}
          {output && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Output
              </span>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-50 p-2.5 font-mono text-xs leading-5 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
                {output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
