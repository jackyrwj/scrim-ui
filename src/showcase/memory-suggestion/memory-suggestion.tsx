"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type MemorySuggestionProps = {
  fact: string;
  saved?: boolean;
  onSave?: () => void;
  onDismiss?: () => void;
  onUndo?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      {...props}
    >
      <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="12"
      height="12"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* MemorySuggestion                                                    */
/* ------------------------------------------------------------------ */

export function MemorySuggestion({
  fact,
  saved = false,
  onSave,
  onDismiss,
  onUndo,
  className = "",
}: MemorySuggestionProps) {
  if (saved) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-900/20 ${className}`}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckIcon />
        </span>
        <p className="min-w-0 flex-1 text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Saved to memory
        </p>
        {onUndo && (
          <Button variant="ghost" size="sm"
            type="button"
            onClick={onUndo}
            className="shrink-0 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
          >
            Undo
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card
      className={`flex-row gap-0 py-0 flex items-start gap-3 rounded-xl border border-border bg-card p-4 ${className}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <SparkleIcon />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 text-muted-foreground">
          Want me to remember this?{" "}
          <span className="font-medium text-foreground">“{fact}”</span>
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <Button variant="default" size="sm"
            type="button"
            onClick={onSave}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <CheckIcon />
            Save to memory
          </Button>
          {onDismiss && (
            <Button variant="outline" size="sm"
              type="button"
              onClick={onDismiss}
              className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Not now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
