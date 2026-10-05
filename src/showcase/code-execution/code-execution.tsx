"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
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
    ? "bg-muted text-muted-foreground"
    : failed
      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";

  const statusText = running ? "Running" : failed ? "Failed" : "Succeeded";

  return (
    <div className={`overflow-hidden rounded-xl border border-border ${className}`}>
      <div className="flex items-center gap-2 bg-muted px-3 py-2">
        <span className="text-muted-foreground">
          <TerminalIcon />
        </span>
        <span className="text-sm font-medium text-foreground">
          Code execution
        </span>
        {duration && (
          <span className="text-xs text-muted-foreground">{duration}</span>
        )}
        <span className="ml-auto flex items-center gap-2">
          {running && onStop && (
            <Button variant="outline" size="sm"
              type="button"
              onClick={onStop}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              <span className="h-2 w-2 rounded-[2px] bg-current" />
              Stop
            </Button>
          )}
          <Badge variant="secondary" className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusPill}`}>
            {running ? (
              <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
            ) : failed ? (
              <XIcon />
            ) : (
              <CheckIcon />
            )}
            {statusText}
          </Badge>
        </span>
      </div>

      <pre className="overflow-x-auto bg-muted px-3 py-2.5 text-sm leading-5 text-muted-foreground">
        <code>{code}</code>
      </pre>

      {(output || error) && (
        <pre className={`overflow-x-auto px-3 py-2.5 text-xs leading-5 ${failed ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-muted text-muted-foreground"}`}>
          {failed ? error : output}
        </pre>
      )}

      {!running && (output || error) && (
        <div className={`flex items-center gap-1.5 px-3 pb-2 text-xs ${failed ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
          <span className="font-medium">exit {exitCode}</span>
          {duration && ` · ${duration}`}
        </div>
      )}
    </div>
  );
}
