"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AgentState = "running" | "waiting" | "completed" | "failed";

export type AgentStatusProps = {
  name: string;
  status: AgentState;
  action?: string;
  progress?: number;
  elapsed?: string;
  icon?: React.ReactNode;
  onStop?: () => void;
  onRetry?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function BotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <rect width="18" height="10" x="3" y="8" rx="2" />
      <path d="M12 8V4a2 2 0 0 1 2-2h2" />
      <circle cx="9" cy="13" r="0.5" fill="currentColor" />
      <circle cx="15" cy="13" r="0.5" fill="currentColor" />
      <path d="M5 11v6M19 11v6M9 17h6" />
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

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11" {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
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
/* Status pill + progress                                              */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<AgentState, { pill: string; icon: React.ReactNode; label: string }> = {
  running: {
    pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    icon: (
      <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
    ),
    label: "Running",
  },
  waiting: {
    pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    icon: <PauseIcon />,
    label: "Waiting",
  },
  completed: {
    pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    icon: <CheckIcon />,
    label: "Completed",
  },
  failed: {
    pill: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    icon: <XIcon />,
    label: "Failed",
  },
};

/* ------------------------------------------------------------------ */
/* AgentStatus                                                         */
/* ------------------------------------------------------------------ */

export function AgentStatus({
  name,
  status,
  action,
  progress,
  elapsed,
  icon,
  onStop,
  onRetry,
  className = "",
}: AgentStatusProps) {
  const s = STATUS_STYLES[status];

  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-3.5 transition-colors dark:border-zinc-800 dark:bg-zinc-900 ${
        status === "failed"
          ? "border-red-200 dark:border-red-900/60"
          : status === "running"
            ? "border-zinc-300 dark:border-zinc-700"
            : ""
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            status === "failed"
              ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
              : status === "completed"
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {icon ?? <BotIcon />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {name}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${s.pill}`}>
              {s.icon}
              {s.label}
            </span>
            {elapsed && <span className="text-xs tabular-nums text-zinc-400">{elapsed}</span>}
          </div>
          {action && (
            <p className="mt-0.5 truncate text-[13px] text-zinc-500 dark:text-zinc-400">{action}</p>
          )}
        </div>

        {status === "running" && onStop && (
          <button
            type="button"
            onClick={onStop}
            aria-label={`Stop ${name}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <StopIcon />
          </button>
        )}
        {status === "failed" && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Retry
          </button>
        )}
      </div>

      {/* Progress bar */}
      {status === "running" && progress !== undefined && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
