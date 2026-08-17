"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CodeExecutionProps = {
  code: string;
  status?: "running" | "success" | "error";
  /** stdout captured so far / on success. */
  output?: string;
  /** stderr for the error state. */
  error?: string;
  exitCode?: number;
  /** Elapsed time, e.g. "1.2s". */
  duration?: string;
  onStop?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* CodeExecution                                                       */
/* ------------------------------------------------------------------ */

export function CodeExecution({
  code,
  status = "success",
  output,
  error,
  exitCode = 0,
  duration,
  onStop,
  className = "",
}: CodeExecutionProps) {
  const running = status === "running";
  const failed = status === "error";

  const statusPill = running
    ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
    : failed
      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";

  const statusText = running ? "Running" : failed ? "Failed" : "Succeeded";

  return (
    <div className={`overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <div className="flex items-center gap-2 bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
        <span className="text-zinc-400 dark:text-zinc-500">
          <TerminalIcon />
        </span>
        <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">
          Code execution
        </span>
        {duration && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{duration}</span>
        )}
        <span className="ml-auto flex items-center gap-2">
          {running && onStop && (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex h-6 items-center gap-1 rounded-md border border-zinc-200 px-2 text-[11px] text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <span className="h-2 w-2 rounded-[2px] bg-current" />
              Stop
            </button>
          )}
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusPill}`}>
            {running ? (
              <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
            ) : failed ? (
              <XIcon />
            ) : (
              <CheckIcon />
            )}
            {statusText}
          </span>
        </span>
      </div>

      <pre className="overflow-x-auto bg-zinc-950 px-3 py-2.5 text-[13px] leading-5 text-zinc-100 dark:bg-zinc-900">
        <code>{code}</code>
      </pre>

      {(output || error) && (
        <pre className={`overflow-x-auto px-3 py-2.5 text-[12px] leading-5 ${failed ? "bg-red-950/40 text-red-300" : "bg-zinc-50 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300"}`}>
          {failed ? error : output}
        </pre>
      )}

      {!running && (output || error) && (
        <div className={`flex items-center gap-1.5 px-3 pb-2 text-[11px] ${failed ? "text-red-600 dark:text-red-400" : "text-zinc-400 dark:text-zinc-500"}`}>
          <span className="font-medium">exit {exitCode}</span>
          {duration && ` · ${duration}`}
        </div>
      )}
    </div>
  );
}
