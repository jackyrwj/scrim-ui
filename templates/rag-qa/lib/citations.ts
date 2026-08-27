/**
 * Reading `[2]` out of a stream that has not finished arriving.
 *
 * This is the third place the citation pipeline can lose, after chunking and
 * retrieval, and it is the one that looks like a rendering bug rather than a
 * data bug.
 *
 * The problem: the model writes `…rose 14% in Q3 [2]. The margin…`, but the
 * transport hands you that in whatever pieces the tokeniser produced. A
 * realistic sequence is:
 *
 *     "…rose 14% in Q3 "   "["   "2"   "]"   ". The margin…"
 *
 * Parse each frame independently and the reader watches `[`, then `[2`, then
 * `[2]` flash through the text before it finally becomes a chip. Multiply by
 * every citation in the answer and the whole reply flickers — which is worse
 * than not streaming, because it reads as broken rather than as fast.
 *
 * The naive fixes are both bad. Buffering until the message completes throws
 * away the streaming feel you were trying to sell. Regex-replacing on each
 * frame produces the flicker above. What works is a parser that knows the
 * difference between "this text is finished" and "this text might be the
 * start of a marker", and holds back only the second kind.
 *
 * So `parseCitations` returns segments plus a `pending` string: the trailing
 * characters that are still ambiguous. The renderer draws the segments and
 * simply does not draw `pending` — at most three characters withheld for one
 * frame, invisible to a reader, versus a marker flashing its own syntax.
 *
 * No dependencies and no React. It is a pure function of a string, which is
 * also what makes it testable — and the invariant to test against is that for
 * every prefix of a final answer, `segments.map(text).join("") + pending`
 * equals that prefix. Nothing is ever dropped, only deferred.
 */

export type CitationSegment =
  | { type: "text"; text: string }
  /** A resolved marker. `n` is the number the model wrote — the same number
   *  `formatContext` gave the passage, and the key the UI looks up. */
  | { type: "citation"; text: string; n: number };

export type ParsedAnswer = {
  segments: CitationSegment[];
  /** Withheld: could still turn into a marker on the next frame. */
  pending: string;
};

/* One or more digits in square brackets. Deliberately narrow — `[note]` and
   `[1,2]` and Markdown links `[text](url)` all stay as plain text rather than
   being half-recognised, because a citation that resolves to nothing is worse
   than one that was never claimed. The system prompt asks for `[1][3]`, two
   markers, which this matches as two. */
const MARKER = /\[(\d{1,3})\]/g;

export function parseCitations(text: string): ParsedAnswer {
  const segments: CitationSegment[] = [];
  const re = new RegExp(MARKER.source, MARKER.flags);
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) pushText(segments, text.slice(last, match.index));
    segments.push({ type: "citation", text: match[0], n: Number(match[1]) });
    last = match.index + match[0].length;
  }

  const tail = text.slice(last);
  const hold = ambiguousTailLength(tail);
  if (tail.length > hold) pushText(segments, tail.slice(0, tail.length - hold));

  return { segments, pending: hold > 0 ? tail.slice(tail.length - hold) : "" };
}

/**
 * How many characters at the end might still become a marker.
 *
 * `[`, `[1`, `[12` — a prefix of the pattern with the closing bracket not yet
 * arrived. Anything else is settled text and goes out this frame. Four is the
 * ceiling, given `\d{1,3}`.
 */
function ambiguousTailLength(tail: string): number {
  const open = tail.lastIndexOf("[");
  if (open === -1) return 0;
  const after = tail.slice(open + 1);
  /* A closing bracket already arrived and the regex above did not match it,
     so whatever this is, it is not a citation and never will be. */
  if (after.includes("]")) return 0;
  return /^\d{0,3}$/.test(after) ? tail.length - open : 0;
}

/** Coalesce, so a run of frames does not become a hundred text segments
 *  React has to reconcile on every token. */
function pushText(segments: CitationSegment[], text: string) {
  if (text.length === 0) return;
  const last = segments[segments.length - 1];
  if (last?.type === "text") last.text += text;
  else segments.push({ type: "text", text });
}

/**
 * Which passages the answer actually cited, in the order it first cited them.
 *
 * Not the same list as what was retrieved, and the difference is worth
 * showing: five passages went into the prompt, the model used two. Listing
 * all five under the answer as "sources" implies a support they do not have —
 * which is the same overclaim as citing nothing at all, pointed the other
 * way.
 */
export function citedNumbers(segments: CitationSegment[]): number[] {
  const seen: number[] = [];
  for (const segment of segments) {
    if (segment.type === "citation" && !seen.includes(segment.n)) seen.push(segment.n);
  }
  return seen;
}
