"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as React from "react";

/**
 * "Memory updated" — the receipt for a thing the product did for you.
 *
 * When the assistant quietly saves a fact about the user, something has to
 * make that save visible, or memory becomes surveillance. The toast is the
 * receipt: it says what was stored, in the user's own words, the moment it
 * happens.
 *
 * **The content of the toast is the fact itself**, not the event. "Memory
 * updated" alone is a receipt with no items on it — the user still has no
 * idea what is now remembered about them. Lead with the saved fact; the
 * "Saved to memory" label is context, not content.
 *
 * **Undo beats Manage as the primary action.** The common case is "no,
 * that's wrong" or "I didn't mean in general" — one tap and it never
 * happened. Manage (the full memory panel) is the secondary path for the
 * rare audit, so it stays a quiet text link.
 *
 * **It is a notification, not a dialog.** It must not steal focus or block
 * the composer; the user was mid-conversation. Dismissal and timing are the
 * caller's job — this renders the toast; when to show and for how long is a
 * product decision.
 */

export type MemoryToastProps = {
  /** The fact that was saved, in the user's words — the content of the receipt. */
  fact: string;
  /** What happened to it. */
  kind?: "saved" | "updated" | "forgotten";
  /** One-tap reversal — the primary action. */
  onUndo?: () => void;
  /** Open the full memory panel. Always secondary to undo. */
  onManage?: () => void;
  className?: string;
};

const LABELS = {
  saved: "Saved to memory",
  updated: "Memory updated",
  forgotten: "Forgotten",
} as const;

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function MemoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* MemoryToast                                                         */
/* ------------------------------------------------------------------ */

export function MemoryToast({
  fact,
  kind = "saved",
  onUndo,
  onManage,
  className = "",
}: MemoryToastProps) {
  return (
    <Card
      role="status"
      className={`flex-row gap-0 py-0 flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-sm ${className}`}
    >
      <span className="shrink-0 text-muted-foreground">
        <MemoryIcon />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-muted-foreground">
          {LABELS[kind]}
        </div>
        <p className="truncate text-sm text-foreground">{fact}</p>
      </div>

      {(onUndo || onManage) && (
        <div className="flex shrink-0 items-center gap-2.5">
          {onUndo && (
            <Button variant="ghost" size="sm"
              type="button"
              onClick={onUndo}
              className="text-xs font-medium text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              Undo
            </Button>
          )}
          {onManage && (
            <Button variant="ghost" size="sm"
              type="button"
              onClick={onManage}
              className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Manage
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
