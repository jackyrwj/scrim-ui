"use client";

import * as React from "react";

/**
 * The question that answers itself.
 *
 * Rendered from a **client-side tool** — one with no `execute`, so the SDK
 * emits the call and waits for the browser. The user's click becomes the
 * tool's output, the model reads it as a tool result, and the conversation
 * carries on. That is a different thing from a button that sends a message:
 * the answer arrives attached to the question the model asked, so the model
 * cannot lose track of which one was answered.
 *
 * `answered` renders the chosen option instead of the buttons. Not for
 * tidiness — a set of live buttons above a conversation that has already
 * moved past them is an invitation to click something twice.
 */

export function AskChoice({
  question,
  options,
  answered,
  onChoose,
}: {
  question: string;
  options: { id: string; label: string; hint?: string }[];
  /** The chosen option's label, once there is one. */
  answered?: string;
  onChoose: (option: { id: string; label: string }) => void;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-900 dark:text-zinc-100">{question}</p>

      {answered ? (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-[13px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {answered}
        </p>
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChoose(option)}
              title={option.hint}
              className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
