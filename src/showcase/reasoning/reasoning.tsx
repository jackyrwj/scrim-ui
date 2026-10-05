"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4h3Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44A2.5 2.5 0 0 0 20 17.5v-11A2.5 2.5 0 0 0 17.5 4h-3Z" />
      <path d="M12 5v1M12 18v1" />
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

function StopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" {...props}>
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
    <Card
      className={`gap-0 py-0 overflow-hidden rounded-xl border border-border bg-card transition-colors ${className}`}
    >
      {/* Header */}
      <Button variant="ghost" size="sm"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="h-auto min-h-8 whitespace-normal justify-start flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <BrainIcon />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {isThinking ? "Reasoning" : "Reasoning trace"}
        </span>
        {elapsed && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{elapsed}</span>}
        {isThinking && (
          <Badge variant="secondary" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
            <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
            Thinking
          </Badge>
        )}
        <span className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronIcon />
        </span>
      </Button>

      {/* Steps */}
      {open && (
        <div className="border-t border-border px-4 py-3">
          {steps.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-muted" />
              <span>Formulating an approach…</span>
            </div>
          ) : (
            <ol className="relative space-y-3 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-muted">
              {steps.map((step, i) => (
                <li key={i} className="relative pl-6">
                  <span className="absolute left-0 top-1 flex h-[15px] w-[15px] items-center justify-center rounded-full border border-border bg-card text-xs text-muted-foreground">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  {step.detail && (
                    <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                      {step.detail}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}

          {isThinking && onStop && (
            <Button variant="outline" size="sm"
              type="button"
              onClick={onStop}
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              <StopIcon />
              Stop reasoning
            </Button>
          )}
          {!isThinking && steps.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckIcon />
              Reasoning complete — {steps.length} step{steps.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
