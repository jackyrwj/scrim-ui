"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="m4 17 6-6-6-6M12 19h8" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
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
      <Button variant="ghost" size="sm"
        type="button"
        onClick={onCancel}
        disabled={!onCancel}
        title="Cancel"
        /* min-h-6: py-0.5 on 11px text left a 20.5px-tall tap target, under the
           24x24 minimum. The pill's look is unchanged at this size. */
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:bg-muted disabled:hover:bg-muted"
      >
        <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
        Running
        {onCancel && (
          <span className="text-muted-foreground">
            <StopIcon />
          </span>
        )}
      </Button>
    );
  }
  if (status === "success") {
    return (
      <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
        <CheckIcon />
        Completed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-400">
      <XIcon />
      Failed
    </Badge>
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
    <Card
      className={`gap-0 py-0 overflow-hidden rounded-xl border border-border bg-card transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        status === "error"
          ? "border-red-200 dark:border-red-900/60"
          : status === "running"
            ? "border-border"
            : ""
      } ${className}`}
    >
      {/* Header.

          The disclosure button covers the icon, name and duration only. It
          used to wrap the whole row, which put StatusPill's Cancel button
          inside it — nested buttons are invalid HTML, and React refuses to
          hydrate them. The pill and the chevron are siblings of the button
          now, so both controls stay independently clickable. */}
      <div className="flex w-full items-center gap-3 px-4 py-2.5">
        <Button variant="ghost" size="sm"
          type="button"
          onClick={() => hasDetails && setOpen((v) => !v)}
          aria-expanded={open}
          disabled={!hasDetails}
          className="flex min-h-8 min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            status === "error"
              ? "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400"
              : status === "running"
                ? "bg-muted text-muted-foreground"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {icon ?? <TerminalIcon />}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {name}
        </span>
        {duration && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{duration}</span>}
        </Button>
        <span className="shrink-0">
          <StatusPill status={status} onCancel={onCancel} />
        </span>
        {hasDetails && (
          <Button variant="ghost" size="icon-sm"
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Hide details" : "Show details"}
            className={`min-h-6 min-w-6 flex size-7 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          >
            <ChevronIcon />
          </Button>
        )}
      </div>

      {/* Details */}
      {open && hasDetails && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {input && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Input
              </span>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-5 text-foreground">
                {input}
              </pre>
            </div>
          )}
          {output && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Output
              </span>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-5 text-foreground">
                {output}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
