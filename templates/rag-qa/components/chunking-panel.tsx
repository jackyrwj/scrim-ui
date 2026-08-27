"use client";

import * as React from "react";
import {
  CHUNK_LIMITS,
  effectiveOverlap,
  STRATEGY_HINTS,
  type ChunkOptions,
  type ChunkStrategy,
} from "@/lib/chunk";

/**
 * The chunking controls, and why they are in the product rather than in a
 * config file.
 *
 * Chunk size is the single setting that most changes how a RAG app behaves,
 * and it has no good default — it depends on the document. Long chunks
 * retrieve reliably and cite uselessly, because "the passage this came from"
 * turns out to be a page and a half. Short chunks cite beautifully and
 * retrieve badly, because the sentence that answers the question no longer
 * contains the words the question used. Everybody discovers this, and
 * everybody discovers it by editing a constant, re-ingesting, and squinting.
 *
 * So the constant is a control, the effect is visible, and the price is
 * stated: re-chunking re-embeds, which is a real call to the embedding API
 * and real money. That is why Apply is a button and size is not a live
 * slider — a slider here would spend a cent per pixel.
 *
 * `pending` versus `applied` is the whole state model. What the controls show
 * is what you have dialled in; what the numbers under them describe is what
 * retrieval is actually using right now. Keeping those visibly separate is
 * what stops the panel from lying between an edit and an Apply.
 */

export type ChunkingPanelProps = {
  /** What retrieval is using now. */
  applied: ChunkOptions;
  appliedStats?: { chunkCount: number; embedMs: number };
  onApply: (options: ChunkOptions) => void;
  busy?: boolean;
};

const STRATEGIES: ChunkStrategy[] = ["paragraph", "sentence", "fixed"];

export function ChunkingPanel({ applied, appliedStats, onApply, busy }: ChunkingPanelProps) {
  const [pending, setPending] = React.useState<ChunkOptions>(applied);

  /* The applied options change under this component when a new document is
     ingested. Adjusting state during render rather than syncing it in an
     effect: an effect would paint one frame of the previous document's
     settings, and a setState in an effect body is a second render pass for
     something React can do in the first. */
  const [lastApplied, setLastApplied] = React.useState(applied);
  if (lastApplied !== applied) {
    setLastApplied(applied);
    setPending(applied);
  }

  const dirty =
    pending.strategy !== applied.strategy ||
    pending.size !== applied.size ||
    pending.overlap !== applied.overlap;

  return (
    <section className="rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-800">
      <h3 className="text-[12px] font-medium">Chunking</h3>

      <div className="mt-2.5 flex gap-1">
        {STRATEGIES.map((strategy) => (
          <button
            key={strategy}
            type="button"
            onClick={() => setPending((p) => ({ ...p, strategy }))}
            data-selected={pending.strategy === strategy ? "" : undefined}
            className="flex-1 rounded-md border border-zinc-200 px-2 py-1 text-[11px] capitalize transition-colors data-selected:border-zinc-900 data-selected:bg-zinc-900 data-selected:text-zinc-50 dark:border-zinc-700 dark:data-selected:border-zinc-100 dark:data-selected:bg-zinc-100 dark:data-selected:text-zinc-900"
          >
            {strategy}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] leading-4 text-zinc-500">
        {STRATEGY_HINTS[pending.strategy]}
      </p>

      <Slider
        label="Target size"
        suffix="chars"
        value={pending.size}
        min={CHUNK_LIMITS.size.min}
        max={CHUNK_LIMITS.size.max}
        step={50}
        /* Dragging size down can leave overlap above the cap, so it comes
           with it. Silently keeping a value the chunker would ignore is how
           the panel and retrieval end up describing different documents. */
        onChange={(size) =>
          setPending((p) => ({ ...p, size, overlap: effectiveOverlap(size, p.overlap) }))
        }
      />
      <Slider
        label="Overlap"
        suffix="chars"
        value={pending.overlap}
        min={CHUNK_LIMITS.overlap.min}
        /* Capped against the current size, not at the constant — chunkDocument
           enforces the same half-of-size rule (see effectiveOverlap), and a
           slider that travels past the point where its value stops mattering
           is a control that lies about what it does. Dragging size down drags
           the overlap with it, which is the honest behaviour. */
        max={Math.min(CHUNK_LIMITS.overlap.max, effectiveOverlap(pending.size, CHUNK_LIMITS.overlap.max))}
        step={20}
        onChange={(overlap) => setPending((p) => ({ ...p, overlap }))}
      />
      <p className="mt-1.5 text-[11px] leading-4 text-zinc-500">
        Overlap repeats the tail of each chunk at the head of the next, so a sentence that straddles
        a boundary is still retrievable whole.
      </p>

      <div className="mt-3 flex items-center gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <div className="min-w-0 flex-1 text-[11px] leading-4 text-zinc-500">
          {appliedStats ? (
            <>
              <span className="tabular-nums">{appliedStats.chunkCount}</span> chunks in use ·{" "}
              <span className="tabular-nums">{appliedStats.embedMs}ms</span> to embed
            </>
          ) : (
            "Applies to the next upload."
          )}
        </div>
        <button
          type="button"
          disabled={!dirty || busy}
          onClick={() => onApply(pending)}
          className="shrink-0 rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-50 transition-opacity disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {busy ? "Re-embedding…" : "Apply"}
        </button>
      </div>
      {dirty && !busy && (
        /* Said before the click, not after. Someone dragging a slider on a
           400-chunk document is about to spend money, and finding that out
           from a bill is the wrong order. */
        <p className="mt-1.5 text-[11px] leading-4 text-amber-700 dark:text-amber-400">
          Applying re-chunks and re-embeds the whole document — one more embedding call.
        </p>
      )}
    </section>
  );
}

function Slider({
  label,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const id = React.useId();
  return (
    <div className="mt-2.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-[11px]">
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="tabular-nums text-zinc-900 dark:text-zinc-100">
          {value} {suffix}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-zinc-900 dark:accent-zinc-100"
      />
    </div>
  );
}
