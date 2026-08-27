"use client";

import * as React from "react";
import { parseCitations } from "@/lib/citations";
import type { SourceRef } from "@/lib/message";
import { Citation } from "./ui/citation";

/**
 * One answer, rendering as it arrives.
 *
 * All the difficulty is in lib/citations.ts; what is left here is doing
 * nothing clever with the result. Two rules:
 *
 * `pending` is not rendered. Those are the characters that might still turn
 * out to be a `[`, and drawing them is the flicker the parser exists to
 * prevent. They arrive one frame later as either text or a chip, and the
 * reader never sees the difference.
 *
 * The caret goes after the last segment, not after `pending`. It marks where
 * the text has got to, and putting it past withheld characters makes it jump
 * backwards when a marker resolves.
 */

export type AnswerProps = {
  text: string;
  sources: SourceRef[];
  /** The document's text — every passage is a slice of it. */
  documentText: string;
  streaming?: boolean;
  onJump?: (source: SourceRef) => void;
};

export function Answer({ text, sources, documentText, streaming, onJump }: AnswerProps) {
  /* Re-parsing the whole answer on every frame rather than parsing the delta.
     It is a linear scan over a few hundred characters at 20-ish frames a
     second, which is nothing, and an incremental parser here would have to
     carry the ambiguous-tail state across frames — the same bug, moved
     somewhere harder to see. */
  const { segments } = React.useMemo(() => parseCitations(text), [text]);

  /* Number → passage. The lookup that turns `[2]` into something to show, and
     the reason a citation of a number that was never retrieved renders as a
     struck-through marker rather than a broken chip. */
  const byNumber = React.useMemo(() => {
    const map = new Map<number, SourceRef>();
    for (const source of sources) map.set(source.n, source);
    return map;
  }, [sources]);

  return (
    <p className="whitespace-pre-wrap text-[14px] leading-7 text-zinc-800 dark:text-zinc-200">
      {segments.map((segment, i) => {
        if (segment.type === "text") return <React.Fragment key={i}>{segment.text}</React.Fragment>;
        const source = byNumber.get(segment.n);
        return (
          <Citation
            key={i}
            n={segment.n}
            /* Sliced here, from the document, by the offsets that came off
               the wire. If this ever shows the wrong sentence, the offsets
               are wrong — and so is the highlight in the reading pane, in
               exactly the same way. One source of truth, one bug. */
            passage={source ? documentText.slice(source.start, source.end) : undefined}
            score={source?.score}
            onJump={source && onJump ? () => onJump(source) : undefined}
          />
        );
      })}
      {streaming && (
        <span
          className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500"
          aria-hidden
        />
      )}
    </p>
  );
}
