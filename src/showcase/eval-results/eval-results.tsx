"use client";

import * as React from "react";

/**
 * Pass rates for a suite of test cases, this run against the last one.
 *
 * The table is easy. What makes an eval view useful or useless is what it
 * does with the two numbers per row:
 *
 * **A delta is not a result.** 8/10 to 9/10 is one sample changing its mind,
 * and on a non-deterministic system that happens for free. So every row
 * carries its sample count, and any change smaller than the noise floor is
 * rendered as *unchanged* rather than as a green arrow. A green arrow that
 * means nothing is worse than no arrow, because someone will ship on it.
 *
 * **Regressions first, always.** Sorting alphabetically, or by pass rate,
 * buries the two rows that are the reason anyone opened the page. Improvements
 * are pleasant; regressions are the job.
 *
 * **A new case is not an improvement.** A row with no baseline has nothing to
 * compare against, and rendering it as +100% is how a suite that grew looks
 * like a model that got better.
 *
 * **Partial results are partial.** While a run is in flight the summary is
 * computed over the cases that have finished, and cases finish in whatever
 * order they were scheduled — which is not random with respect to difficulty
 * if anything is batched. So the header says how many have reported, and the
 * unfinished rows stay visible rather than being filtered out.
 */

export type EvalCase = {
  id: string;
  name: string;
  /** 0–1. Undefined means this case is new: nothing to compare against. */
  baseline?: number;
  /** 0–1. Undefined means it has not reported yet in this run. */
  current?: number;
  /** How many times the case was run. A delta over five samples is a rumour. */
  samples: number;
};

export type EvalResultsProps = {
  cases: EvalCase[];
  baselineLabel?: string;
  currentLabel?: string;
  /**
   * Deltas smaller than this are shown as unchanged. Default 0.05 — with the
   * sample counts most suites actually run, anything tighter is noise wearing
   * a colour.
   */
  noiseFloor?: number;
  /** Below this, no delta is called at all regardless of size. */
  minSamples?: number;
  running?: boolean;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ArrowIcon({ up, ...props }: { up: boolean } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" {...props}>
      {up ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Classification                                                      */
/* ------------------------------------------------------------------ */

type Verdict = "regression" | "improvement" | "unchanged" | "new" | "pending" | "undercounted";

function verdictOf(c: EvalCase, noiseFloor: number, minSamples: number): Verdict {
  if (c.current === undefined) return "pending";
  if (c.baseline === undefined) return "new";
  if (c.samples < minSamples) return "undercounted";
  const delta = c.current - c.baseline;
  if (Math.abs(delta) < noiseFloor) return "unchanged";
  return delta < 0 ? "regression" : "improvement";
}

/* Regressions, then anything still uncertain, then improvements, then the
   rows nobody needs to look at. Within a group, worst delta first. */
const ORDER: Record<Verdict, number> = {
  regression: 0,
  undercounted: 1,
  pending: 2,
  new: 3,
  improvement: 4,
  unchanged: 5,
};

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

/* ------------------------------------------------------------------ */
/* EvalResults                                                         */
/* ------------------------------------------------------------------ */

export function EvalResults({
  cases,
  baselineLabel = "baseline",
  currentLabel = "this run",
  noiseFloor = 0.05,
  minSamples = 10,
  running = false,
  className = "",
}: EvalResultsProps) {
  const rows = React.useMemo(() => {
    return cases
      .map((c) => ({ c, verdict: verdictOf(c, noiseFloor, minSamples) }))
      .sort((x, y) => {
        const byGroup = ORDER[x.verdict] - ORDER[y.verdict];
        if (byGroup !== 0) return byGroup;
        const dx = (x.c.current ?? 0) - (x.c.baseline ?? 0);
        const dy = (y.c.current ?? 0) - (y.c.baseline ?? 0);
        return dx - dy;
      });
  }, [cases, noiseFloor, minSamples]);

  const reported = cases.filter((c) => c.current !== undefined);
  /* Averaged over reported cases only, and labelled as such. A mean that
     silently treats an unfinished case as zero is a number that improves as
     the run progresses for reasons that have nothing to do with the model. */
  const mean =
    reported.length === 0
      ? undefined
      : reported.reduce((sum, c) => sum + (c.current ?? 0), 0) / reported.length;
  const regressions = rows.filter((r) => r.verdict === "regression").length;

  return (
    <div className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-zinc-100 px-3.5 py-2.5 dark:border-zinc-800">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {mean === undefined ? "—" : pct(mean)}
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          mean over {reported.length} of {cases.length} cases
        </span>
        {running && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
            running
          </span>
        )}
        {regressions > 0 && (
          <span className="ml-auto text-[11px] font-medium text-red-600 dark:text-red-400">
            {regressions} regression{regressions === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              <th className="px-3.5 py-2 font-medium">Case</th>
              <th className="px-2 py-2 text-right font-medium">{baselineLabel}</th>
              <th className="px-2 py-2 text-right font-medium">{currentLabel}</th>
              <th className="px-3.5 py-2 text-right font-medium">Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, verdict }) => (
              <tr
                key={c.id}
                className="border-t border-zinc-100 align-top dark:border-zinc-800/80"
              >
                <td className="px-3.5 py-2">
                  <span className="text-zinc-800 dark:text-zinc-100">{c.name}</span>
                  <span className="ml-2 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                    n={c.samples}
                  </span>
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-zinc-500 dark:text-zinc-400">
                  {c.baseline === undefined ? "—" : pct(c.baseline)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-zinc-800 dark:text-zinc-100">
                  {c.current === undefined ? "—" : pct(c.current)}
                </td>
                <td className="px-3.5 py-2 text-right">
                  <Delta c={c} verdict={verdict} minSamples={minSamples} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="border-t border-zinc-100 px-3.5 py-2 text-[11px] leading-4 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        Changes under {pct(noiseFloor)} are shown as unchanged, and no delta is called below{" "}
        {minSamples} samples. Both are guesses about your noise, not facts about it — measure the
        variance of a repeated run and set them from that.
      </p>
    </div>
  );
}

function Delta({ c, verdict, minSamples }: { c: EvalCase; verdict: Verdict; minSamples: number }) {
  if (verdict === "pending") {
    return <span className="text-[11px] text-zinc-400 dark:text-zinc-500">waiting</span>;
  }
  if (verdict === "new") {
    /* Not +100%. A suite that grew is not a model that improved. */
    return <span className="text-[11px] text-zinc-400 dark:text-zinc-500">new case</span>;
  }
  if (verdict === "undercounted") {
    return (
      <span className="text-[11px] text-amber-600 dark:text-amber-500" title={`Fewer than ${minSamples} samples.`}>
        too few to call
      </span>
    );
  }
  if (verdict === "unchanged") {
    return <span className="text-[11px] text-zinc-400 dark:text-zinc-500">unchanged</span>;
  }

  const delta = (c.current ?? 0) - (c.baseline ?? 0);
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center justify-end gap-1 text-[11px] font-medium tabular-nums ${
        up ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      <ArrowIcon up={up} />
      {up ? "+" : "−"}
      {Math.abs(Math.round(delta * 100))}%
    </span>
  );
}
