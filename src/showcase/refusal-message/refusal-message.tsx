"use client";

import * as React from "react";

/**
 * Say no like a colleague, not like a firewall.
 *
 * A bare "I can't help with that" is a dead end: the user learns nothing and
 * the conversation is over. A useful refusal does three things, in order —
 * states what won't be done, says why in the user's terms (never a policy
 * clause number, which reads as hiding behind a rulebook), and offers the one
 * pivot that is still on the table.
 *
 * **The redirect is the component.** `suggestion` is not decoration; it is
 * the difference between a refusal and a rejection. When it is present it is
 * a button, because making the user retype the safe version of their own
 * request is friction added at exactly the moment they are most frustrated.
 *
 * **A refusal is not an error.** No red, no alert triangle — the system
 * worked as intended. The surface stays neutral so the reader's eye goes to
 * the words, not to alarm styling the situation has not earned.
 *
 * **Keep it in the thread.** The refusal is an assistant turn like any other;
 * pulling it out into a modal or a banner breaks the conversation's record of
 * what was asked and declined.
 */

export type RefusalMessageProps = {
  /** The refusal itself, in one or two plain sentences. */
  message: string;
  /** The plain-language basis for the refusal — "why", not a policy citation. */
  reason?: string;
  /** The offered pivot. Rendered as an action, not a hint. */
  suggestion?: string;
  /** Fired when the reader accepts the pivot — typically sends it as a new prompt. */
  onSuggestion?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* RefusalMessage                                                      */
/* ------------------------------------------------------------------ */

export function RefusalMessage({
  message,
  reason,
  suggestion,
  onSuggestion,
  className = "",
}: RefusalMessageProps) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <span className="mt-0.5 shrink-0 text-zinc-500 dark:text-zinc-400">
        <ShieldIcon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 text-zinc-900 dark:text-zinc-100">{message}</p>

        {/* zinc-600 on the caption: it sits on the zinc-50 surface, where
            zinc-500 measures under AA at 12px. */}
        {reason && (
          <p className="mt-1.5 text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Why: </span>
            {reason}
          </p>
        )}

        {suggestion && (
          <button
            type="button"
            onClick={onSuggestion}
            className="mt-2.5 inline-flex h-7 max-w-full items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <span className="truncate">{suggestion}</span>
            <span className="shrink-0">
              <ArrowRightIcon />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
