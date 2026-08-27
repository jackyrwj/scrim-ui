"use client";

import * as React from "react";
import { CitationPopover } from "./citation-popover";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const PASSAGE =
  "Chunks are stored as positions, not strings. Every chunk carries the start and end offset it was cut from, and the invariant chunk.text === source.slice(chunk.start, chunk.end) is asserted in development.";

/**
 * `passage` empty is not an empty passage — it is the unresolved state, which
 * is the whole reason this component is more than a tooltip. So the snippet is
 * hand-written: the interesting difference between the presets is which props
 * are *absent*, and a generator that omits empty strings would show that
 * correctly for `passage` and then also silently drop `source` and `onJump`
 * for reasons the reader cannot see.
 */
export const citationPopoverControls: ComponentControls = {
  tag: "CitationPopover",
  importFrom: "./citation-popover",
  controls: [
    { kind: "number", name: "n", label: "Marker number", value: 1, min: 1, max: 99, step: 1 },
    { kind: "text", name: "passage", label: "Passage (empty = unresolved)", value: PASSAGE, multiline: true },
    { kind: "text", name: "source", label: "Source label", value: "chunking.md · lines 12–18" },
    { kind: "number", name: "score", label: "Score (0 hides it)", value: 0.834, min: 0, max: 1, step: 0.001 },
    { kind: "boolean", name: "jump", label: "Jumps to the document", value: false },
  ],
  snippet: (v) => {
    if (!String(v.passage).trim()) {
      return `{/* No passage with this number was retrieved. */}\n<CitationPopover n={${v.n}} />\n`;
    }
    const props = [`n={${v.n}}`, "passage={passage}"];
    if (String(v.source).trim()) props.push(`source="${v.source}"`);
    if (Number(v.score) > 0) props.push(`score={${v.score}}`);
    if (v.jump) props.push("onJump={() => scrollToPassage(1)}");
    return `<CitationPopover\n${props.map((p) => "  " + p).join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "resolved",
      title: "Resolved",
      note: "The ordinary case — a marker with a passage behind it, previewed on hover, tap or focus.",
      values: { n: 1, passage: PASSAGE, source: "chunking.md · lines 12–18", score: 0, jump: false },
    },
    {
      id: "scored",
      title: "With score",
      note: "Similarity in the header. Worth showing while you are tuning the relevance floor, and worth hiding once it is set.",
      values: { n: 1, passage: PASSAGE, source: "chunking.md · lines 12–18", score: 0.834, jump: false },
    },
    {
      id: "jump",
      title: "Jumps to the document",
      note: "With a document pane on screen, the click should land on the sentence. The popover becomes the preview, not the destination.",
      values: { n: 2, passage: PASSAGE, source: "chunking.md · lines 12–18", score: 0, jump: true },
    },
    {
      id: "unresolved",
      title: "Number the model invented",
      note: "Six passages retrieved, a seventh cited. The claim stays in the text; the marker stops promising a source it cannot show.",
      values: { n: 7, passage: "", source: "", score: 0, jump: false },
    },
  ],
};

export function renderCitationPopover(v: ControlValues, key: string) {
  const passage = String(v.passage).trim();
  return (
    <p key={key} className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-200">
      Retrieval keeps the offsets rather than the text, so a citation resolves to a range in the
      original document{" "}
      <CitationPopover
        n={Number(v.n)}
        passage={passage === "" ? undefined : String(v.passage)}
        source={String(v.source).trim() === "" ? undefined : String(v.source)}
        score={Number(v.score) > 0 ? Number(v.score) : undefined}
        onJump={v.jump ? () => {} : undefined}
      />{" "}
      instead of to a filename — which is the difference between a source list at the bottom and a
      claim you can check.
    </p>
  );
}
