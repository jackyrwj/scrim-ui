"use client";

import * as React from "react";
import { RELEVANCE_FLOOR } from "@/lib/retrieve";
import type { SourceRef } from "@/lib/message";

/**
 * What was retrieved, what was used, and how close the rest were.
 *
 * The usual "Sources" footer lists everything retrieval returned, which
 * quietly overstates the case: five passages went into the prompt and the
 * model answered from two, so three of those links are pointing at text that
 * had nothing to do with the sentence above them. Marking which ones were
 * actually cited costs one array lookup and is the difference between a
 * source list and a source *claim*.
 *
 * The scores are shown because this is a template and whoever installs it has
 * to tune RELEVANCE_FLOOR against their own corpus. In a shipped product they
 * would probably go — a user has no use for 0.412 — but the day a question
 * gets "I could not find anything" and the reader is sure it is in there, the
 * number beside the near-miss is the entire debugging session.
 */

export type SourcesProps = {
  sources: SourceRef[];
  documentText: string;
  cited: number[];
  activeSource?: SourceRef;
  onSelect: (source: SourceRef) => void;
};

export function Sources({ sources, documentText, cited, activeSource, onSelect }: SourcesProps) {
  if (sources.length === 0) return null;

  /* Counted over the passages, not over the citations. The model sometimes
     cites a number it was never given — the answer above renders those struck
     through — and counting raw markers here produced "4 of 2 passages cited",
     which is both wrong and the kind of wrong that makes a reader distrust
     every other number on the page. */
  const usedCount = sources.filter((source) => cited.includes(source.n)).length;

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        {usedCount} of {sources.length} passages cited
      </p>
      <ul className="space-y-1">
        {sources.map((source) => {
          const used = cited.includes(source.n);
          return (
            <li key={source.chunkId}>
              <button
                type="button"
                onClick={() => onSelect(source)}
                /* The visible label is the passage itself, which a screen
                   reader would read out in full before saying what the
                   control does. Naming it explicitly puts the action first. */
                aria-label={`Passage ${source.n}${used ? ", cited" : ", not cited"} — jump to it in the document`}
                data-active={activeSource?.chunkId === source.chunkId ? "" : undefined}
                className="flex w-full gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:bg-zinc-100 data-active:border-amber-300 data-active:bg-amber-50 dark:hover:bg-zinc-900 dark:data-active:border-amber-500/40 dark:data-active:bg-amber-950/30"
              >
                <span
                  className={`mt-px flex h-[1.15rem] w-[1.15rem] shrink-0 items-center justify-center rounded text-[10px] font-medium tabular-nums ${
                    used
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200"
                      : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  {source.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-[11.5px] leading-4 text-zinc-600 dark:text-zinc-400">
                    {/* Sliced from the document, like every other rendering of
                        a passage in this app. See lib/message.ts. */}
                    {documentText.slice(source.start, source.end)}
                  </span>
                  <span className="mt-0.5 block text-[10px] tabular-nums text-zinc-400">
                    {source.score.toFixed(3)}
                    {source.score < RELEVANCE_FLOOR + 0.05 && " · near the floor"}
                    {!used && " · not cited"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
