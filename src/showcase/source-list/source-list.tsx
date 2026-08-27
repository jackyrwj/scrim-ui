"use client";

import * as React from "react";

/**
 * What retrieval actually returned — including what it returned and threw away.
 *
 * Most source panels show the top k passages and stop. The two things worth
 * building are the ones that get left out:
 *
 * **The floor has to be visible.** A retrieval system with no relevance floor
 * always returns something, and "something" for a question the corpus does
 * not answer is the closest match to a question nobody asked. Showing the
 * floor, and the candidates that fell under it, is what turns "the model made
 * this up" into "nothing relevant was found and it answered anyway" — two
 * different bugs, in two different files.
 *
 * **Nothing found is a state, not an empty list.** It is the state that makes
 * a RAG system trustworthy: no chunk cleared the floor, no model call, a
 * fixed "it is not in these documents". Rendering it as a blank panel throws
 * away the one moment the system was behaving well.
 *
 * The scores are shown because someone is always tuning the floor, and a
 * floor set without looking at the distribution it is cutting is a number
 * somebody guessed.
 */

export type RetrievedSource = {
  id: string;
  /** Document name, section, page — whatever locates it for a human. */
  title: string;
  passage: string;
  /** Similarity, 0–1. */
  score: number;
};

export type SourceListProps = {
  /** Every candidate considered, not only the ones that passed. */
  sources: RetrievedSource[];
  /** Below this, a passage was not sent to the model. */
  floor?: number;
  /** Jump to the passage in the document. */
  onOpen?: (id: string) => void;
  className?: string;
};

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Row({
  source,
  n,
  below,
  onOpen,
}: {
  source: RetrievedSource;
  n?: number;
  below: boolean;
  onOpen?: (id: string) => void;
}) {
  const body = (
    <>
      <div className="flex items-baseline gap-2">
        {n !== undefined && (
          <span className="flex h-[1.35em] min-w-[1.35em] shrink-0 items-center justify-center rounded-[0.3em] bg-amber-100 px-[0.3em] text-[11px] font-medium text-amber-900 tabular-nums dark:bg-amber-400/20 dark:text-amber-200">
            {n}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
          {source.title}
        </span>
        <span
          className={`shrink-0 tabular-nums text-[11px] ${
            below ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {source.score.toFixed(3)}
        </span>
      </div>
      <p
        className={`mt-1 line-clamp-2 text-[12px] leading-5 ${
          below ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-600 dark:text-zinc-300"
        }`}
      >
        {source.passage}
      </p>
    </>
  );

  if (!onOpen) {
    return <div className="px-3.5 py-2.5">{body}</div>;
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(source.id)}
      className="block w-full px-3.5 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
    >
      {body}
    </button>
  );
}

export function SourceList({ sources, floor = 0, onOpen, className = "" }: SourceListProps) {
  const [showBelow, setShowBelow] = React.useState(false);

  /* Sorted here rather than trusted from the caller: a panel whose order
     disagrees with its own score column is the kind of bug nobody reports
     and everybody stops trusting. */
  const ranked = React.useMemo(() => [...sources].sort((a, b) => b.score - a.score), [sources]);
  const passed = ranked.filter((s) => s.score >= floor);
  const below = ranked.filter((s) => s.score < floor);

  return (
    <div className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-baseline gap-2 border-b border-zinc-100 px-3.5 py-2.5 dark:border-zinc-800">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Retrieved
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {passed.length} of {ranked.length} candidates
        </span>
        {floor > 0 && (
          <span className="ml-auto tabular-nums text-[11px] text-zinc-400 dark:text-zinc-500">
            floor {floor.toFixed(2)}
          </span>
        )}
      </div>

      {passed.length === 0 ? (
        /* The good state, rendered as such. Nothing cleared the floor, so no
           model call was made and the answer is a fixed sentence — which is
           the behaviour that makes the rest of the system worth trusting. */
        <div className="px-3.5 py-4">
          <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
            Nothing cleared the floor.
          </p>
          <p className="mt-1 text-[12px] leading-5 text-zinc-500 dark:text-zinc-400">
            The closest candidate scored {ranked[0]?.score.toFixed(3) ?? "—"}. No model call was
            made — an answer built from these passages would have been invented.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {passed.map((s, i) => (
            <Row key={s.id} source={s} n={i + 1} below={false} onOpen={onOpen} />
          ))}
        </div>
      )}

      {below.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowBelow((v) => !v)}
            aria-expanded={showBelow}
            className="flex w-full items-center gap-1.5 px-3.5 py-2 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
          >
            <ChevronIcon className={showBelow ? "rotate-180" : ""} />
            {below.length} below the floor — not sent to the model
          </button>
          {showBelow && (
            <div className="divide-y divide-zinc-100 bg-zinc-50/60 dark:divide-zinc-800/80 dark:bg-zinc-800/20">
              {below.map((s) => (
                <Row key={s.id} source={s} below onOpen={onOpen} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
