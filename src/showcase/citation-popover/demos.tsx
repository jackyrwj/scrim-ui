"use client";

import * as React from "react";
import { CitationPopover } from "./citation-popover";

const PASSAGE_1 =
  "Chunks are stored as positions, not strings. Every chunk carries the start and end offset it was cut from, and the invariant chunk.text === source.slice(chunk.start, chunk.end) is asserted in development — a chunk that has lost its offsets can still answer a question, but it can no longer be pointed at.";

const PASSAGE_2 =
  "Sources are written to the stream as a data part before the first token of the answer. A marker that arrives at token 40 can then resolve immediately, rather than rendering as inert text until the response settles.";

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-200">{children}</p>;
}

export function DemoDefault() {
  return (
    <div className="space-y-4">
      <Prose>
        Retrieval keeps the offsets rather than the text, so a citation resolves to a range in the
        original document <CitationPopover n={1} passage={PASSAGE_1} source="chunking.md · lines 12–18" score={0.834} /> instead
        of to a filename. The sources are sent before the first token{" "}
        <CitationPopover n={2} passage={PASSAGE_2} source="streaming.md · lines 3–7" score={0.791} />, which is what lets a
        marker mid-answer become clickable the moment it appears.
      </Prose>
      <Prose>
        Hover, tap or tab to a marker to read the passage. A number with nothing behind it{" "}
        <CitationPopover n={7} /> stays in the text and stops pretending to be a source.
      </Prose>
    </div>
  );
}

export function DemoResolved() {
  return (
    <Prose>
      The invariant is asserted in development{" "}
      <CitationPopover n={1} passage={PASSAGE_1} source="chunking.md · lines 12–18" />, so a chunk
      that loses its offsets fails loudly at the point it was cut rather than quietly at the point
      it was cited.
    </Prose>
  );
}

export function DemoUnresolved() {
  return (
    <Prose>
      Six passages were retrieved and the answer cited a seventh{" "}
      <CitationPopover n={7} />. The claim stays; the marker stops claiming to have a source behind
      it.
    </Prose>
  );
}

export function DemoScored() {
  return (
    <Prose>
      With the score shown, the relevance floor is visible while you tune it{" "}
      <CitationPopover n={2} passage={PASSAGE_2} source="streaming.md · lines 3–7" score={0.791} /> —
      a passage that scraped in at 0.31 looks different from one that landed at 0.79.
    </Prose>
  );
}
