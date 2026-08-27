"use client";

import * as React from "react";

/**
 * Two answers, side by side, pick the better one.
 *
 * The interface is trivial and the measurement is fragile, which is the
 * opposite of how it looks. Three biases will eat the data before anyone
 * reads it:
 *
 * **Label bias.** Show the model names and you are no longer measuring the
 * answers. People know which model they expect to be better and they are
 * right often enough that the belief survives contact with the evidence. So
 * the names are hidden until a choice is made, and revealed straight after —
 * concealing them permanently just makes the tool feel like it is hiding
 * something.
 *
 * **Position bias.** Left wins more than right, reliably, for no reason
 * anyone likes. The fix is not in this component: **randomise which candidate
 * you pass as `a` on every comparison**, and record which model actually sat
 * in each slot. A component cannot do that for you — it only ever sees one
 * pair — so it says so here rather than pretending the problem is solved.
 *
 * **Length bias.** Longer answers win, and a pane that grows with its content
 * advertises which one is longer before a word is read. Both panes are the
 * same height and scroll independently, which does not remove the bias but
 * stops the layout from amplifying it.
 *
 * And `tie` is a first-class answer. Forcing a winner out of two
 * indistinguishable outputs manufactures signal, and manufactured signal is
 * worse than a smaller sample — it is confidently wrong in whichever
 * direction the position bias points.
 */

export type Candidate = {
  id: string;
  /** Revealed only after a choice. */
  model: string;
  text: string;
};

export type Choice = "a" | "b" | "tie";

export type OutputComparisonProps = {
  prompt?: string;
  a: Candidate;
  b: Candidate;
  /** The recorded choice, if any. */
  choice?: Choice;
  /** Force the labels visible. Defaults to "once a choice exists". */
  revealed?: boolean;
  onChoose?: (choice: Choice, winnerId: string | undefined) => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Pane                                                                */
/* ------------------------------------------------------------------ */

function Pane({
  slot,
  candidate,
  revealed,
  won,
  decided,
}: {
  slot: "A" | "B";
  candidate: Candidate;
  revealed: boolean;
  won: boolean;
  decided: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col rounded-xl border transition-colors ${
        won
          ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-900/10"
          : decided
            ? "border-zinc-200 opacity-60 dark:border-zinc-800"
            : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {slot}
        </span>
        <span className="min-w-0 truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          {revealed ? candidate.model : "hidden until you choose"}
        </span>
        {won && (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            <CheckIcon width="11" height="11" />
            Preferred
          </span>
        )}
      </div>
      {/* Fixed height, independent scroll. A pane that grows with its content
          announces which answer is longer before either has been read. */}
      <div className="h-52 overflow-y-auto px-3 py-2.5 text-[13px] leading-6 text-zinc-700 dark:text-zinc-200">
        <p className="whitespace-pre-wrap">{candidate.text}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OutputComparison                                                    */
/* ------------------------------------------------------------------ */

export function OutputComparison({
  prompt,
  a,
  b,
  choice,
  revealed,
  onChoose,
  className = "",
}: OutputComparisonProps) {
  const decided = choice !== undefined;
  const showLabels = revealed ?? decided;

  const buttons: { value: Choice; label: string }[] = [
    { value: "a", label: "A is better" },
    { value: "tie", label: "Tie" },
    { value: "b", label: "B is better" },
  ];

  return (
    <div className={className}>
      {prompt && (
        <p className="mb-3 rounded-lg bg-zinc-100 px-3 py-2 text-[13px] leading-6 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">
          {prompt}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Pane slot="A" candidate={a} revealed={showLabels} won={choice === "a"} decided={decided} />
        <Pane slot="B" candidate={b} revealed={showLabels} won={choice === "b"} decided={decided} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {buttons.map((btn) => {
          const active = choice === btn.value;
          return (
            <button
              key={btn.value}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChoose?.(btn.value, btn.value === "a" ? a.id : btn.value === "b" ? b.id : undefined)
              }
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-medium transition-colors ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {active && <CheckIcon width="11" height="11" />}
              {btn.label}
            </button>
          );
        })}

        {!decided && (
          <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">
            Randomise which model is A on every comparison
          </span>
        )}
        {choice === "tie" && (
          <span className="ml-auto text-[11px] text-zinc-500 dark:text-zinc-400">
            Recorded as a tie — better than a coin flip you cannot see later
          </span>
        )}
      </div>
    </div>
  );
}
