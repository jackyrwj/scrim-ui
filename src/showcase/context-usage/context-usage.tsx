"use client";

import * as React from "react";

/**
 * How much of the context window is gone, and to what.
 *
 * A single "78% full" bar is the version everyone builds, and it answers the
 * wrong question. By the time a reader looks at this they are already in
 * trouble; what they need is *what to remove* and *what will be removed for
 * them*.
 *
 * **Reserve room for the reply.** The window is shared between what you send
 * and what comes back. A bar that reads 96% full with no reply reserved is
 * describing a request that cannot succeed, in the cheerful voice of one that
 * nearly can. So `reserve` is subtracted up front and drawn as its own
 * segment — the usable space is what is left after the answer has its room.
 *
 * **Eviction order is the actionable part.** Something gets dropped when the
 * next message does not fit, and the reader is entitled to know what before
 * it happens rather than after they notice the model forgot a file. The
 * segments are listed in the order they will be evicted, and the first one is
 * named in the warning.
 *
 * **Token counts are per-tokenizer.** The same text is a different number of
 * tokens on a different model, so a count carried over from another provider
 * is decoration. Count with the tokenizer of the model you are about to call,
 * or say the figure is an estimate.
 */

export type ContextSegment = {
  label: string;
  tokens: number;
  /**
   * Position in the eviction order — lower goes first. Segments that cannot
   * be evicted (the system prompt, usually) should be left undefined.
   */
  evictionRank?: number;
};

export type ContextUsageProps = {
  /** Total window for the model, in tokens. */
  window: number;
  segments: ContextSegment[];
  /** Tokens held back for the reply. */
  reserve?: number;
  /** True when the count came from a different tokenizer than the model's. */
  estimated?: boolean;
  className?: string;
};

const COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-lime-500",
];

function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

export function ContextUsage({
  window: windowSize,
  segments,
  reserve = 0,
  estimated = false,
  className = "",
}: ContextUsageProps) {
  const used = segments.reduce((sum, s) => sum + s.tokens, 0);
  const usable = Math.max(0, windowSize - reserve);
  const free = usable - used;
  const overflowing = free < 0;
  /* Tight at 85% of the USABLE window, not of the whole one — the difference
     is exactly the reply, which is the thing that breaks first. */
  const tight = !overflowing && used / usable > 0.85;

  /* Named here rather than in the warning string so the two cannot disagree:
     the first segment to go is the lowest eviction rank, and a segment with
     no rank is not evictable at all. */
  const evictable = segments
    .filter((s) => s.evictionRank !== undefined)
    .sort((a, b) => (a.evictionRank ?? 0) - (b.evictionRank ?? 0));
  const firstOut = evictable[0];

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {estimated && "~"}
          {formatTokens(used)}
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          of {formatTokens(usable)} usable
          {reserve > 0 && ` · ${formatTokens(reserve)} held for the reply`}
        </span>
        <span
          className={`ml-auto text-[11px] font-medium tabular-nums ${
            overflowing
              ? "text-red-600 dark:text-red-400"
              : tight
                ? "text-amber-600 dark:text-amber-500"
                : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {overflowing ? `${formatTokens(-free)} over` : `${formatTokens(free)} left`}
        </span>
      </div>

      {/* One track, segmented. Separate bars per segment would let each one
          look full on its own scale, which is the opposite of the point. */}
      <div className="mt-2 flex h-2 gap-px overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className={`h-full ${COLORS[i % COLORS.length]}`}
            style={{ width: `${Math.min(100, (s.tokens / usable) * 100)}%` }}
            title={`${s.label} — ${formatTokens(s.tokens)}`}
          />
        ))}
        {reserve > 0 && !overflowing && (
          <div
            /* Striped rather than solid: it is not used, and it is not free
               either. A solid block reads as another consumer. */
            className="h-full bg-[repeating-linear-gradient(45deg,rgb(161_161_170/0.5)_0_3px,transparent_3px_6px)]"
            style={{ width: `${Math.max(0, (free / usable) * 100)}%` }}
            title={`${formatTokens(free)} free`}
          />
        )}
      </div>

      <dl className="mt-2.5 space-y-1">
        {segments.map((s, i) => (
          <div key={s.label} className="flex items-baseline gap-2 text-[11px]">
            <span className={`h-2 w-2 shrink-0 rounded-sm ${COLORS[i % COLORS.length]}`} />
            <dt className="text-zinc-600 dark:text-zinc-300">{s.label}</dt>
            {s.evictionRank === undefined && (
              <span className="rounded bg-zinc-100 px-1 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                pinned
              </span>
            )}
            <dd className="ml-auto shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
              {formatTokens(s.tokens)}
            </dd>
          </div>
        ))}
      </dl>

      {(tight || overflowing) && (
        <p
          className={`mt-2.5 border-t pt-2 text-[11px] leading-4 ${
            overflowing
              ? "border-red-100 text-red-600 dark:border-red-900/40 dark:text-red-400"
              : "border-zinc-100 text-amber-600 dark:border-zinc-800 dark:text-amber-500"
          }`}
        >
          {firstOut
            ? `${overflowing ? "Does not fit" : "Running out"} — “${firstOut.label}” is dropped first.`
            : `${overflowing ? "Does not fit" : "Running out"}, and nothing here is evictable.`}
        </p>
      )}

      {estimated && (
        <p className="mt-1.5 text-[11px] leading-4 text-zinc-400 dark:text-zinc-500">
          Counted with a different tokenizer than the model uses — treat it as an estimate.
        </p>
      )}
    </div>
  );
}
