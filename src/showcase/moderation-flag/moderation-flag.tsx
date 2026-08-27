"use client";

import * as React from "react";

/**
 * The classifier fired. Now be honest about it.
 *
 * Moderation interrupts at two very different moments, and one component
 * covers both because the reader's question is the same — "what just
 * happened, and what can I do about it?"
 *
 * - `output`: the response was streaming and got cut. **Keep the partial
 *   text on screen.** Deleting already-streamed words the user has read is
 *   gaslighting — they saw them, and pretending otherwise destroys trust in
 *   every other message. The partial stays, dimmed and faded where it broke,
 *   with the notice attached to the cut.
 * - `input`: the prompt never reached the model. Nothing was generated, so
 *   there is nothing to preserve — only the block and the way forward.
 *
 * **Always offer the false-positive path.** Classifiers are wrong often
 * enough that "Report a mistake" is not a courtesy, it is the mechanism by
 * which the flagging gets better — and the only thing that keeps a legitimate
 * user (the fiction writer, the security researcher, the nurse) from reading
 * the flag as an accusation.
 *
 * **One recovery action, not two.** Retry regenerates; appeal disputes. Both
 * at once and the user cannot tell which one their situation calls for, so
 * the appeal lives as a quiet text link and the primary action is the way
 * forward.
 */

export type ModerationFlagProps = {
  /** Where the flag fired: on the prompt, or mid-response. */
  stage: "input" | "output";
  /** The partial response, kept visible where the stream was cut. Output stage only. */
  stoppedText?: string;
  /** What happened, in one plain sentence. */
  message: string;
  /** Primary recovery — regenerate, or edit and resend the prompt. */
  onRetry?: () => void;
  /** The false-positive path. Rendered as a quiet link, always secondary. */
  onAppeal?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ModerationFlag                                                      */
/* ------------------------------------------------------------------ */

export function ModerationFlag({
  stage,
  stoppedText,
  message,
  onRetry,
  onAppeal,
  className = "",
}: ModerationFlagProps) {
  const isOutput = stage === "output";

  return (
    <div className={className}>
      {/* The cut partial: still readable, visibly unfinished. The mask fades
          the tail so the eye lands on the notice as the end of the turn. */}
      {isOutput && stoppedText && (
        <p
          className="mb-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400 [mask-image:linear-gradient(to_bottom,black_35%,transparent)]"
          aria-hidden="true"
        >
          {stoppedText}
        </p>
      )}

      <div className="flex items-start gap-3 rounded-2xl rounded-tl-md border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
        <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400">
          <FlagIcon />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {isOutput ? "Response stopped" : "Message not sent"}
          </div>
          {/* zinc-600 on both caption and link: they sit on the tinted amber
              surface, where zinc-500 measures under AA at 12-13px. */}
          <p className="mt-0.5 text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">{message}</p>

          {(onRetry || onAppeal) && (
            <div className="mt-2 flex items-center gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <RetryIcon />
                  {isOutput ? "Regenerate" : "Edit and resend"}
                </button>
              )}
              {onAppeal && (
                <button
                  type="button"
                  onClick={onAppeal}
                  className="text-xs font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Report a mistake
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
