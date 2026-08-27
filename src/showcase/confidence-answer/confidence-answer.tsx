"use client";

import * as React from "react";

/**
 * An answer that says how sure it is.
 *
 * Language models are wrong in the same tone of voice they are right, and a
 * reader has no way to tell which they just got. The fix is not a disclaimer
 * under the whole chat ("AI can make mistakes" — invisible by day two); it is
 * a qualifier attached to *this* answer, calibrated to *this* claim.
 *
 * **Badge the uncertainty, not the certainty.** A "high confidence" mark on
 * every solid answer trains the eye to skip the badge row entirely, and the
 * one answer that needed scrutiny gets it least. High confidence renders as
 * quiet text; the badge appears when there is something to warn about.
 *
 * **The hedge belongs at the claim, not the footer.** `hedge` sits directly
 * under the answer, one sentence saying *what specifically* might be off —
 * a number, a date, a version. "This might be wrong" is noise; "I may be
 * confusing this with the 2023 edition" is information.
 *
 * **Never a bare percentage.** "73% confident" borrows the vocabulary of
 * measurement for a number that is not one. Three honest levels — phrased as
 * guidance on what to do next — beat a false-precision score every time.
 */

export type ConfidenceAnswerProps = {
  /** How sure the answer is. Drives both the badge and its wording. */
  confidence: "high" | "medium" | "low";
  /** The answer itself. */
  text: string;
  /** The specific thing to double-check, in one sentence — shown for medium and low. */
  hedge?: string;
  className?: string;
};

const LEVELS = {
  medium: { label: "Worth double-checking", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  low: { label: "Treat as a guess", dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
} as const;

/* ------------------------------------------------------------------ */
/* ConfidenceAnswer                                                    */
/* ------------------------------------------------------------------ */

export function ConfidenceAnswer({
  confidence,
  text,
  hedge,
  className = "",
}: ConfidenceAnswerProps) {
  const warn = confidence !== "high";
  const level = warn ? LEVELS[confidence] : null;

  const surface =
    confidence === "low"
      ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"
      : confidence === "medium"
        ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20"
        : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";

  return (
    <div className={`rounded-2xl rounded-tl-md border px-4 py-3 ${surface} ${className}`}>
      <p className="text-sm leading-6 text-zinc-900 dark:text-zinc-100">{text}</p>

      {/* High confidence renders as a plain answer — badging certainty trains
          the eye to skip the badge row, and the warning that matters gets
          ignored with the rest. */}
      {level && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${level.dot}`} />
          <span className={`text-xs font-medium ${level.text}`}>{level.label}</span>
        </div>
      )}

      {/* zinc-600 on the amber surface: zinc-500 measures under AA at 13px. */}
      {warn && hedge && (
        <p className="mt-1 text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">{hedge}</p>
      )}
    </div>
  );
}
