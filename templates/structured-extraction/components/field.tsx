"use client";

import * as React from "react";
import { confidenceBand, formatMoney, type FieldState } from "@/lib/partial";
import type { FieldSpec } from "@/lib/schema";

/**
 * One field of the form.
 *
 * The row exists from the first frame, before any data — the shape comes from
 * the schema, not from the response. That is the whole anti-layout-shift
 * strategy: there is nothing to insert, only something to fill in.
 *
 * A fixed height (`h-9` on the value area) is the other half of it. A value
 * that wraps to two lines when it lands would push everything below it down,
 * so long values truncate and reveal on hover instead.
 */

const BAND_STYLES = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-red-500",
  unknown: "bg-zinc-300 dark:bg-zinc-700",
} as const;

const BAND_LABELS = {
  high: "High confidence",
  medium: "Worth checking",
  low: "Probably wrong — check this",
  unknown: "No confidence reported",
} as const;

export function Field({
  spec,
  state,
  value,
  confidence,
  evidence,
  currency,
  correction,
  warning,
  onCorrect,
}: {
  spec: FieldSpec;
  state: FieldState;
  value: string | number | undefined;
  confidence: number | undefined;
  evidence: string | undefined;
  currency: string | undefined;
  /** A local edit, which always wins over the extracted value. */
  correction: string | undefined;
  /** Set when a cross-field check disagrees with this value. */
  warning?: string;
  onCorrect: (next: string | undefined) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const band = confidenceBand(confidence);
  const corrected = correction !== undefined;

  const display =
    correction ??
    (state === "settled" && spec.kind === "money" && typeof value === "number"
      ? formatMoney(value, currency)
      : typeof value === "string"
        ? value
        : typeof value === "number"
          ? String(value)
          : "");

  return (
    <div className={spec.half ? "" : "sm:col-span-2"}>
      <div className="flex items-center gap-1.5">
        <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {spec.label}
        </label>

        {/* Confidence, as a dot with a title rather than a number. The reader's
            question is "do I need to check this one?", and 0.62 does not
            answer it without them doing the mapping themselves. */}
        {state === "settled" && !corrected && (
          <span
            className={`h-1.5 w-1.5 rounded-full ${BAND_STYLES[band]}`}
            title={
              confidence === undefined
                ? BAND_LABELS.unknown
                : `${BAND_LABELS[band]} — ${Math.round(confidence * 100)}%`
            }
            aria-label={BAND_LABELS[band]}
          />
        )}
        {corrected && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
            edited
          </span>
        )}
      </div>

      {/* Fixed height. This is what stops the form dancing as values land. */}
      <div className="mt-1 flex h-9 items-center">
        {editing ? (
          <input
            autoFocus
            defaultValue={display}
            onBlur={(event) => {
              setEditing(false);
              const next = event.target.value;
              /* Editing a field back to what the model said is not a
                 correction — clearing it restores the confidence dot rather
                 than leaving a permanent "edited" badge on an unchanged
                 value. */
              onCorrect(next === display && !corrected ? undefined : next);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                event.currentTarget.value = display;
                event.currentTarget.blur();
              }
            }}
            className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-2.5 text-[15px] outline-none dark:border-zinc-600 dark:bg-zinc-900"
          />
        ) : state === "empty" ? (
          /* Not a spinner. A spinner per field turns a form into a slot
             machine; a flat rule says "nothing here yet" and stays still. */
          <span className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" aria-hidden />
        ) : state === "arriving" && spec.kind === "money" ? (
          /* The line this template exists for. A number that is still
             arriving is a WRONG number, not a partial one, so it never
             renders — a shimmer of roughly the right width holds the space
             until the value is final. */
          <span
            className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"
            aria-label={`${spec.label} still arriving`}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            title={display}
            className="group flex h-9 w-full items-center gap-1.5 rounded-lg px-0.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <span
              className={`min-w-0 truncate text-[15px] ${
                warning ? "text-amber-700 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {display || <span className="text-zinc-400">—</span>}
            </span>
            {/* Strings render as they arrive, with a caret, because a
                half-typed name still reads as a name being typed. */}
            {state === "arriving" && (
              <span className="inline-block h-[1.05em] w-[2px] shrink-0 animate-pulse bg-zinc-400 dark:bg-zinc-500" />
            )}
            {state === "settled" && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="ml-auto shrink-0 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600"
                aria-hidden
              >
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {warning && <p className="mt-0.5 text-[11px] leading-4 text-amber-700 dark:text-amber-400">{warning}</p>}

      {/* Where it came from. The reason this is worth the vertical space:
          checking a field against the document is otherwise a re-read of the
          whole document, and a reviewer who has to do that stops reviewing. */}
      {evidence && state === "settled" && !corrected && (
        <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500" title={evidence}>
          “{evidence}”
        </p>
      )}
    </div>
  );
}
