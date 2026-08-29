"use client";

import * as React from "react";

/**
 * An AI edit, reviewable hunk by hunk.
 *
 * Every diff tool shows you what changed. Almost none of them survive the way
 * an AI edit actually arrives — streamed, in pieces, while the reader is
 * already deciding. The four traps and their answers:
 *
 *  1. HUNK BOUNDARIES MOVE UNDER THE CURSOR. A diff that is still streaming
 *     re-splits itself as more arrives, and an index-keyed "accept" then
 *     lands on a different change than the one the reader was looking at.
 *     Here a hunk is an `edit` segment with a caller-given **id**, decisions
 *     are keyed by that id, and segments are only ever appended — so the
 *     hunk a button belongs to cannot change after the button is read.
 *  2. DECIDING ON AN INCOMPLETE HUNK CORRUPTS THE DOCUMENT. An edit whose
 *     replacement text has not finished arriving is not decidable — accept
 *     it and the merged document gets half a function. A hunk with
 *     `complete: false` renders its caret and its buttons stay disabled
 *     until the caller marks it done.
 *  3. PARTIAL ACCEPTANCE MUST LEAVE A COHERENT DOCUMENT. The edit is a list
 *     of segments — `context` (unchanged text) and `edit` (original →
 *     edited) — so `buildMergedDocument` can always produce the whole file:
 *     context verbatim, accepted edits take their replacement, rejected and
 *     undecided edits keep the original. There is no state in which the
 *     output is not a complete document.
 *  4. WORD-LEVEL NOISE HIDES THE ACTUAL CHANGE. Line-level red/green on a
 *     one-word change repaints two whole lines to move one token. Within a
 *     paired removed/added line, only the differing words are marked; the
 *     line pairings are positional, and when the counts differ the extra
 *     lines fall back to whole-line marking rather than a guessed alignment.
 */

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

/**
 * The whole edit, in document order. Streaming appends segments; an `edit`
 * segment still arriving has `complete: false` and may have its `edited`
 * text grow — but its id, and therefore every decision made about it, never
 * moves.
 */
export type DiffSegment =
  | { type: "context"; text: string }
  | {
      type: "edit";
      id: string;
      /** What was there, as one multi-line string. */
      original: string;
      /** What the model proposes instead. */
      edited: string;
      /** What this edit is conceptually about — a function name, a section. */
      context?: string;
      /** False while this hunk is still streaming. Defaults to true. */
      complete?: boolean;
    };

export type DiffDecision = "accepted" | "rejected";

export type DiffDecisions = Record<string, DiffDecision>;

/**
 * The merged document for a set of decisions: context verbatim, accepted
 * edits take `edited`, everything else keeps `original`. Rejected and
 * undecided hunks are indistinguishable in the output on purpose — a
 * document is not a review screen, and "not decided yet" must never leak
 * half an edit into it.
 */
export function buildMergedDocument(segments: DiffSegment[], decisions: DiffDecisions): string {
  return segments
    .map((segment) => {
      if (segment.type === "context") return segment.text;
      return decisions[segment.id] === "accepted" ? segment.edited : segment.original;
    })
    .join("");
}

/* ------------------------------------------------------------------ */
/* Word-level diff                                                     */
/* ------------------------------------------------------------------ */

type WordPart = { text: string; changed: boolean };

/** Split keeping the whitespace, so re-joining the parts is lossless. */
function wordsOf(line: string): string[] {
  return line.split(/(\s+)/).filter((part) => part.length > 0);
}

/**
 * Mark the words that differ between a removed line and its paired added
 * line. Longest-common-subsequence over words: unchanged words are the
 * subsequence, everything else is marked on its own side. Lines are short
 * enough that the quadratic table is never the bottleneck.
 */
function diffWords(removed: string, added: string): { removed: WordPart[]; added: WordPart[] } {
  const a = wordsOf(removed);
  const b = wordsOf(added);

  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const removedParts: WordPart[] = [];
  const addedParts: WordPart[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      removedParts.push({ text: a[i], changed: false });
      addedParts.push({ text: b[j], changed: false });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      removedParts.push({ text: a[i], changed: true });
      i++;
    } else {
      addedParts.push({ text: b[j], changed: true });
      j++;
    }
  }
  while (i < a.length) removedParts.push({ text: a[i++], changed: true });
  while (j < b.length) addedParts.push({ text: b[j++], changed: true });

  return { removed: removedParts, added: addedParts };
}

/* ------------------------------------------------------------------ */
/* Line rendering                                                      */
/* ------------------------------------------------------------------ */

function LineParts({ parts, side }: { parts: WordPart[]; side: "removed" | "added" }) {
  return (
    <>
      {parts.map((part, i) =>
        part.changed ? (
          <span
            key={i}
            className={
              side === "removed"
                ? "rounded-[2px] bg-red-300/70 dark:bg-red-500/40"
                : "rounded-[2px] bg-emerald-300/70 dark:bg-emerald-500/40"
            }
          >
            {part.text}
          </span>
        ) : (
          <React.Fragment key={i}>{part.text}</React.Fragment>
        ),
      )}
    </>
  );
}

function DiffLine({
  line,
  side,
  paired,
  wordDiff,
}: {
  line: string;
  side: "removed" | "added";
  /** The word parts when this line has a pair on the other side. */
  paired: WordPart[] | null;
  wordDiff: boolean;
}) {
  return (
    <div
      className={`flex px-3 leading-6 ${
        side === "removed"
          ? "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200"
          : "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100"
      }`}
    >
      <span
        aria-hidden
        className={`w-4 shrink-0 select-none text-center ${
          side === "removed" ? "text-red-400 dark:text-red-500" : "text-emerald-500 dark:text-emerald-500"
        }`}
      >
        {side === "removed" ? "−" : "+"}
      </span>
      <span className="whitespace-pre-wrap break-all">
        {paired && wordDiff ? <LineParts parts={paired} side={side} /> : line === "" ? " " : line}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hunk                                                                */
/* ------------------------------------------------------------------ */

function Hunk({
  segment,
  decision,
  wordDiff,
  onDecide,
}: {
  segment: Extract<DiffSegment, { type: "edit" }>;
  decision: DiffDecision | undefined;
  wordDiff: boolean;
  onDecide: (id: string, decision: DiffDecision) => void;
}) {
  const complete = segment.complete !== false;

  const removedLines = segment.original.replace(/\n$/, "").split("\n");
  const addedLines = segment.edited.replace(/\n$/, "").split("\n");

  /* Positional pairing: line i of the original against line i of the edit.
     When the counts differ the unpaired remainder marks whole lines, which
     is honest — guessing an alignment would be prettier and wrong. */
  const pairs = Math.min(removedLines.length, addedLines.length);
  const wordParts = React.useMemo(() => {
    if (!wordDiff) return null;
    return Array.from({ length: pairs }, (_, i) => diffWords(removedLines[i], addedLines[i]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment.original, segment.edited, wordDiff]);

  return (
    <div
      data-decision={decision}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white data-[decision=accepted]:border-emerald-300 data-[decision=rejected]:border-zinc-200 data-[decision=rejected]:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:data-[decision=accepted]:border-emerald-800"
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          {segment.context ?? "Edit"}
        </span>

        {!complete && (
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span className="inline-block h-3 w-[6px] animate-pulse rounded-[2px] bg-zinc-400 dark:bg-zinc-500" aria-hidden />
            arriving
          </span>
        )}
        {decision === "accepted" && (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Accepted
          </span>
        )}
        {decision === "rejected" && (
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Rejected
          </span>
        )}

        {/* Disabled while the hunk is still arriving: accepting half an edit
            is how a merged document ends up with half a function. */}
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            disabled={!complete}
            onClick={() => onDecide(segment.id, decision === "accepted" ? "rejected" : "accepted")}
            title={complete ? (decision === "accepted" ? "Undo — reject instead" : "Accept this hunk") : "Still arriving"}
            aria-pressed={decision === "accepted"}
            className={`h-7 rounded-lg px-2.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              decision === "accepted"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            Accept
          </button>
          <button
            type="button"
            disabled={!complete}
            onClick={() => onDecide(segment.id, decision === "rejected" ? "accepted" : "rejected")}
            title={complete ? (decision === "rejected" ? "Undo — accept instead" : "Reject this hunk") : "Still arriving"}
            aria-pressed={decision === "rejected"}
            className={`h-7 rounded-lg px-2.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              decision === "rejected"
                ? "bg-zinc-700 text-white hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            Reject
          </button>
        </div>
      </div>

      <div className="py-1.5 font-mono text-[12.5px]">
        {removedLines.map((line, i) => (
          <DiffLine
            key={`r${i}`}
            line={line}
            side="removed"
            wordDiff={wordDiff}
            paired={wordParts && i < pairs ? wordParts[i].removed : null}
          />
        ))}
        {addedLines.map((line, i) => (
          <DiffLine
            key={`a${i}`}
            line={line}
            side="added"
            wordDiff={wordDiff}
            paired={wordParts && i < pairs ? wordParts[i].added : null}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export type EditDiffViewProps = {
  segments: DiffSegment[];
  /** Controlled decisions. Omit to let the view track them internally. */
  decisions?: DiffDecisions;
  onDecide?: (hunkId: string, decision: DiffDecision) => void;
  /** Called with the full set after Accept all / Reject all — the buttons
   *  only touch hunks that have finished arriving. */
  onDecideAll?: (decision: DiffDecision) => void;
  /** Shown in the header, next to the count. */
  fileName?: string;
  /** True while segments are still being appended. */
  streaming?: boolean;
  wordDiff?: boolean;
  /** Collapse unchanged text between hunks to a gap line. Default true. */
  collapseContext?: boolean;
  className?: string;
};

export function EditDiffView({
  segments,
  decisions: controlled,
  onDecide,
  onDecideAll,
  fileName,
  streaming = false,
  wordDiff = true,
  collapseContext = true,
  className = "",
}: EditDiffViewProps) {
  const [internal, setInternal] = React.useState<DiffDecisions>({});
  const decisions = controlled ?? internal;

  function decide(id: string, decision: DiffDecision) {
    if (controlled) {
      onDecide?.(id, decision);
    } else {
      setInternal((current) => ({ ...current, [id]: decision }));
      onDecide?.(id, decision);
    }
  }

  const edits = segments.filter((s): s is Extract<DiffSegment, { type: "edit" }> => s.type === "edit");
  const completeEdits = edits.filter((e) => e.complete !== false);
  const decidedCount = edits.filter((e) => decisions[e.id]).length;

  function decideAll(decision: DiffDecision) {
    if (controlled) {
      for (const e of completeEdits) onDecide?.(e.id, decision);
    } else {
      setInternal((current) => {
        const next = { ...current };
        for (const e of completeEdits) next[e.id] = decision;
        return next;
      });
    }
    onDecideAll?.(decision);
  }

  return (
    <div className={`rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5">
        <span className="min-w-0 truncate font-mono text-[12px] text-zinc-600 dark:text-zinc-300">
          {fileName ?? "Proposed edits"}
        </span>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500" aria-live="polite">
          {decidedCount} of {edits.length} decided
          {streaming ? " · still arriving" : ""}
        </span>
        <div className="ml-auto flex gap-1.5">
          <button
            type="button"
            onClick={() => decideAll("accepted")}
            disabled={completeEdits.length === 0}
            className="h-7 rounded-lg border border-zinc-200 px-2.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => decideAll("rejected")}
            disabled={completeEdits.length === 0}
            className="h-7 rounded-lg border border-zinc-200 px-2.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reject all
          </button>
        </div>
      </div>

      <div className="space-y-2 px-2 pb-2">
        {segments.map((segment, i) => {
          if (segment.type === "edit") {
            return (
              <Hunk
                key={segment.id}
                segment={segment}
                decision={decisions[segment.id]}
                wordDiff={wordDiff}
                onDecide={decide}
              />
            );
          }
          if (!collapseContext) {
            return (
              <div key={i} className="px-3 font-mono text-[12.5px] leading-6 whitespace-pre-wrap text-zinc-500 dark:text-zinc-400">
                {segment.text.replace(/\n$/, "")}
              </div>
            );
          }
          const lines = segment.text.replace(/\n$/, "").split("\n").length;
          return (
            <div
              key={i}
              className="select-none px-3 py-1 text-center text-[11px] tracking-wide text-zinc-400 dark:text-zinc-500"
            >
              ··· {lines} unchanged {lines === 1 ? "line" : "lines"} ···
            </div>
          );
        })}

        {edits.length === 0 && (
          <p className="px-3 py-8 text-center text-[13px] text-zinc-400 dark:text-zinc-500">
            {streaming ? "Waiting for the first edit…" : "No edits."}
          </p>
        )}
      </div>
    </div>
  );
}
