"use client";

import * as React from "react";
import type { SourceRef } from "@/lib/message";

/**
 * The document, with the cited passages marked in it.
 *
 * This is the end of the chain that started in lib/chunk.ts, and it is where
 * a citation stops being a footnote and becomes a place. Everything it does
 * rests on one line — `text.slice(start, end)` — being the same passage the
 * model was given. If it is, this component is nearly trivial. If it is not,
 * no amount of work here will make the highlight land on the right sentence,
 * which is why the discipline lives upstream.
 *
 * Two things are less trivial than they look.
 *
 * **Ranges overlap.** Chunks overlap by design (see `overlap` in
 * lib/chunk.ts), so two cited passages routinely share a sentence. Rendering
 * them as two independent `<mark>`s produces either nested marks or a double
 * background, and the seam between them is visible. So the ranges are merged
 * into disjoint spans first, each remembering which sources it belongs to.
 *
 * **Scrolling to a range needs an element to scroll to.** Which is the real
 * reason the marks are rendered as elements with refs rather than as styled
 * text: jumping to a citation is `scrollIntoView` on the mark for that
 * source, and a highlight you cannot navigate to is decoration.
 */

export type DocumentPaneProps = {
  name: string;
  text: string;
  sources: SourceRef[];
  /** The one the reader just clicked, drawn stronger than the rest. */
  activeSource?: SourceRef;
  /** How many chunks the document is currently cut into. */
  chunkCount?: number;
};

type Span = {
  start: number;
  end: number;
  /** Source numbers covering this span — plural where chunks overlap. */
  numbers: number[];
};

export function DocumentPane({
  name,
  text,
  sources,
  activeSource,
  chunkCount,
}: DocumentPaneProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const markRefs = React.useRef(new Map<number, HTMLElement>());

  const spans = React.useMemo(() => mergeRanges(sources), [sources]);

  /* Scroll on demand, not on render: the effect keys off the active source,
     so re-rendering during a stream does not keep yanking the pane back. */
  React.useEffect(() => {
    if (!activeSource) return;
    const el = markRefs.current.get(activeSource.n);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSource]);

  const pieces = React.useMemo(() => cut(text, spans), [text, spans]);

  /** Source number → the index of the first piece covering it. */
  const anchorPiece = React.useMemo(() => {
    const map = new Map<number, number>();
    pieces.forEach((piece, i) => {
      for (const n of piece.numbers ?? []) if (!map.has(n)) map.set(n, i);
    });
    return map;
  }, [pieces]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-baseline gap-2 border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <h2 className="truncate text-[13px] font-medium">{name}</h2>
        <span className="ml-auto shrink-0 text-[11px] text-zinc-400 tabular-nums">
          {text.length.toLocaleString()} chars
          {chunkCount ? ` · ${chunkCount} chunks` : ""}
        </span>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {/* whitespace-pre-wrap, not a Markdown renderer. The offsets index
            into the raw text, and rendering Markdown means the characters on
            screen are no longer the characters the offsets counted — a
            heading's `##` disappears, a link becomes its label, and every
            highlight after it lands early. Mapping offsets through a rendered
            tree is doable and is a different component; the honest version
            here shows the document as it was measured. */}
        <div className="whitespace-pre-wrap font-mono text-[12.5px] leading-6 text-zinc-700 dark:text-zinc-300">
          {pieces.map((piece, i) => {
            const numbers = piece.numbers;
            if (!numbers) return <React.Fragment key={i}>{piece.text}</React.Fragment>;
            /* Which source numbers this piece is the FIRST to cover. Only
               those register a ref, so "jump to source 2" lands at the start
               of the passage rather than at whichever fragment an overlap
               with source 4 happened to end on. */
            const anchors = numbers.filter((n) => anchorPiece.get(n) === i);
            return (
              <mark
                key={i}
                ref={(el) => {
                  for (const n of anchors) {
                    if (el) markRefs.current.set(n, el);
                    else markRefs.current.delete(n);
                  }
                }}
                data-active={activeSource && numbers.includes(activeSource.n) ? "" : undefined}
                className="rounded-[3px] bg-amber-100/70 px-px text-zinc-900 transition-colors data-active:bg-amber-300 data-active:ring-2 data-active:ring-amber-400/60 dark:bg-amber-400/15 dark:text-zinc-100 dark:data-active:bg-amber-400/40"
              >
                {piece.text}
              </mark>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Overlapping source ranges → disjoint spans, each carrying every source that
 * covers it.
 *
 * A sweep over the boundary points rather than a pairwise merge: with five
 * sources and an overlap setting that makes three of them touch, pairwise
 * merging is where the off-by-one lives.
 */
function mergeRanges(sources: SourceRef[]): Span[] {
  if (sources.length === 0) return [];

  const points = [...new Set(sources.flatMap((s) => [s.start, s.end]))].sort((a, b) => a - b);
  const spans: Span[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const numbers = sources.filter((s) => s.start <= start && s.end >= end).map((s) => s.n);
    if (numbers.length === 0) continue;
    /* Butt-joined spans with the same owners are one span. Without this a
       highlight is split by every boundary of every other source, and the
       rounded corners show every seam. */
    const previous = spans[spans.length - 1];
    if (previous && previous.end === start && sameNumbers(previous.numbers, numbers)) {
      previous.end = end;
    } else {
      spans.push({ start, end, numbers });
    }
  }

  return spans;
}

function sameNumbers(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((n, i) => n === b[i]);
}

/** The document as alternating plain and highlighted pieces. */
function cut(text: string, spans: Span[]): { text: string; numbers?: number[] }[] {
  const pieces: { text: string; numbers?: number[] }[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start > cursor) pieces.push({ text: text.slice(cursor, span.start) });
    pieces.push({ text: text.slice(span.start, span.end), numbers: span.numbers });
    cursor = span.end;
  }
  if (cursor < text.length) pieces.push({ text: text.slice(cursor) });
  return pieces;
}
