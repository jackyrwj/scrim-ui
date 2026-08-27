import type { UIMessage } from "ai";

/**
 * The message shape, shared by the route that writes it and the components
 * that read it.
 *
 * The interesting field is `sources`, and the interesting thing about it is
 * what it does NOT contain: the passage text. Only offsets.
 *
 * That is not a size optimisation, though it is one. It is the invariant made
 * structural. If a citation carried its own copy of the quoted text, the
 * highlight in the reading pane and the text in the popover could disagree —
 * and the day they disagree is the day you find out the offsets have been
 * wrong for a week, because the popover looked right the whole time. With
 * only `start` and `end` on the wire there is one source of truth, the
 * document, and both the popover and the highlight are `text.slice(start,
 * end)` of it. A drifted offset is visible immediately, in both places, which
 * is the only kind of bug worth having.
 */

export type SourceRef = {
  /** 1-based. The number the model wrote in `[2]`. */
  n: number;
  chunkId: string;
  /** Offsets into the document's text — see the note above. */
  start: number;
  end: number;
  /** Cosine similarity, surfaced in the UI so the floor can be tuned. */
  score: number;
};

export type RagDataParts = {
  /** Written once, before the first token — so a `[2]` can resolve the
   *  instant it arrives rather than after the stream settles. */
  sources: SourceRef[];
};

export type RagUIMessage = UIMessage<never, RagDataParts>;

/** The sources for one assistant message, or an empty list while the stream
 *  is still on its way. */
export function sourcesOf(message: RagUIMessage): SourceRef[] {
  for (const part of message.parts) {
    if (part.type === "data-sources") return part.data;
  }
  return [];
}

/** Every text part, concatenated. A turn is one text part in this template,
 *  but that is a property of the route, not of the transport. */
export function textOf(message: RagUIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
