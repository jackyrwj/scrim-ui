/**
 * Chunking, with offsets that survive the round trip.
 *
 * This file is where citations are won or lost, so it is worth being precise
 * about what makes it different from the chunker in every RAG quickstart.
 *
 * The usual version is one line:
 *
 *     text.split("\n\n").map(s => s.trim())
 *
 * and it is unrecoverable. The moment a chunk becomes a detached string, the
 * only thing you can say about it later is what it *says* — not where it came
 * from. So the citation at the end of the pipeline can be a list of source
 * names and nothing more, because there is no longer a place in the document
 * to point at. Every "sources" footer you have seen is this bug, wearing a
 * design.
 *
 * The fix is not clever, it is just disciplined: a chunk is a `start` and an
 * `end` into the ORIGINAL text, and its `text` is a slice taken from those
 * offsets — never the other way round. Nothing here trims, normalises or
 * re-joins, because each of those quietly moves a boundary. Whitespace is
 * excluded by *moving the offsets*, not by trimming the slice.
 *
 * The invariant, asserted by `verifyChunks` below and worth keeping if you
 * rewrite this file:
 *
 *     chunk.text === source.slice(chunk.start, chunk.end)
 *
 * If that holds, a highlight in the rendered document is `slice(start, end)`
 * and it cannot drift. If it stops holding, every citation is off by the
 * number of characters you trimmed, which is the kind of bug that looks like
 * a rendering problem for two days.
 */

export type ChunkStrategy = "paragraph" | "sentence" | "fixed";

export type ChunkOptions = {
  strategy: ChunkStrategy;
  /** Target characters per chunk. Not a hard cap — a unit is never split. */
  size: number;
  /** Characters of the previous chunk repeated at the head of the next. */
  overlap: number;
};

export const DEFAULT_CHUNKING: ChunkOptions = {
  strategy: "paragraph",
  size: 900,
  overlap: 120,
};

/* Guard rails for the values that arrive from the UI — and from anyone
   POSTing to /api/ingest directly. A `size` of 1 would chunk a 40KB document
   into 40,000 embedding calls. */
export const CHUNK_LIMITS = {
  size: { min: 200, max: 3000 },
  overlap: { min: 0, max: 600 },
} as const;

export type Chunk = {
  /** Stable within a document: the citation marker resolves through this. */
  id: string;
  /** Position in reading order, which is what `[1]` `[2]` in an answer mean. */
  index: number;
  /** Character offset into the document's text, inclusive. */
  start: number;
  /** Character offset into the document's text, exclusive. */
  end: number;
  /** Always `text.slice(start, end)`. See the invariant above. */
  text: string;
};

/** A span of the source document, before it is packed into chunks. */
type Unit = { start: number; end: number };

export function normalizeChunkOptions(input: unknown): ChunkOptions {
  const raw = (input ?? {}) as Partial<ChunkOptions>;
  const strategy: ChunkStrategy =
    raw.strategy === "sentence" || raw.strategy === "fixed" ? raw.strategy : "paragraph";
  const size = clamp(raw.size, DEFAULT_CHUNKING.size, CHUNK_LIMITS.size);
  return {
    strategy,
    size,
    overlap: effectiveOverlap(size, clamp(raw.overlap, DEFAULT_CHUNKING.overlap, CHUNK_LIMITS.overlap)),
  };
}

/**
 * Overlap can never be more than half the target size.
 *
 * The two controls are independent in the UI and their ranges intersect, so
 * "size 200, overlap 600" is one drag away — and it is degenerate: each chunk
 * reaches back further than the whole of the chunk before it, so chunk N
 * *contains* chunk N-1. Retrieval then returns three near-identical passages
 * for the same question, the highlights nest inside each other, and the
 * embedding bill triples for no additional recall.
 *
 * Half is the point past which overlap stops buying anything: a sentence
 * straddling a boundary is already whole in one side or the other. Applied
 * here rather than left to the sliders so that calling chunkDocument
 * directly cannot produce it either.
 */
export function effectiveOverlap(size: number, overlap: number): number {
  return Math.min(overlap, Math.floor(size / 2));
}

function clamp(value: unknown, fallback: number, range: { min: number; max: number }): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(range.max, Math.max(range.min, Math.round(value)));
}

/**
 * Split a document into overlapping chunks that remember where they were.
 *
 * Two passes, and the split is deliberate. The first finds *units* — the
 * places the document itself says it is safe to cut. The second packs units
 * up to `size`. Doing both at once is how chunkers end up splitting a
 * sentence in half at character 900: the packer has to be allowed to overrun
 * the target, because a unit boundary is a fact about the text and `size` is
 * only a preference.
 */
export function chunkDocument(text: string, options: ChunkOptions = DEFAULT_CHUNKING): Chunk[] {
  const units = findUnits(text, options);
  const overlap = effectiveOverlap(options.size, options.overlap);
  const chunks: Chunk[] = [];

  let cursor = 0;
  while (cursor < units.length) {
    let end = cursor;
    let length = 0;

    /* At least one unit per chunk, always — otherwise a paragraph longer than
       `size` produces an empty chunk and then loops forever on it. */
    do {
      length += units[end].end - units[end].start;
      end += 1;
    } while (end < units.length && length + (units[end].end - units[end].start) <= options.size);

    const first = units[cursor];
    const last = units[end - 1];

    /* Overlap reaches BACKWARDS from the chunk's own start rather than
       forwards from the previous chunk's end, so it stays correct at the top
       of the document and after a gap of skipped whitespace. It is what stops
       a claim that straddles a boundary from being unretrievable: neither
       chunk would contain the whole sentence otherwise. */
    const start =
      chunks.length === 0
        ? first.start
        : snapToWord(text, Math.max(0, first.start - overlap), first.start);

    chunks.push({
      id: `c${chunks.length}`,
      index: chunks.length,
      start,
      end: last.end,
      text: text.slice(start, last.end),
    });

    cursor = end;
  }

  return chunks;
}

/**
 * Move an overlap's start forward to the next word boundary.
 *
 * Character overlap lands wherever `size - overlap` puts it, which is
 * usually the middle of a word. That is harmless for retrieval — the
 * embedding barely notices — and not harmless at all for citations, because
 * this offset is where the highlight begins and where the popover's text
 * starts. A passage that opens with "pansion outpaced new logos" reads as a
 * rendering bug, and a reader who sees one stops trusting the rest.
 *
 * Forward rather than backward, and capped at `limit`, so the snap can only
 * ever shrink the overlap. Growing it would push the chunk's start before the
 * offset the caller asked for, which is how an "off by a few characters"
 * becomes "off by a word" somewhere further down.
 */
function snapToWord(text: string, from: number, limit: number): number {
  if (from <= 0 || /\s/.test(text[from - 1])) return from;
  for (let i = from; i < limit; i++) {
    if (/\s/.test(text[i])) return i + 1;
  }
  return limit;
}

/**
 * The safe cut points, as offsets. Every branch returns spans with the
 * surrounding whitespace already excluded — trimming later would be the same
 * mistake this file exists to avoid.
 */
function findUnits(text: string, options: ChunkOptions): Unit[] {
  if (options.strategy === "fixed") return fixedUnits(text, options.size);
  const pattern = options.strategy === "sentence" ? SENTENCE_BREAK : PARAGRAPH_BREAK;
  return splitOn(text, pattern);
}

/* A blank line, allowing for \r\n and for trailing spaces on the empty line —
   both of which are what a real .md file off someone's disk contains. */
const PARAGRAPH_BREAK = /\r?\n[ \t]*\r?\n/g;

/* Sentence-ish. Full stop, question mark or exclamation, followed by space.
   The lookbehind rules out the obvious abbreviations and initials; it is not
   a sentence tokeniser and does not pretend to be. It does not need to be —
   a mis-split here costs a slightly odd chunk boundary, not a wrong
   citation, because the offsets stay honest either way. */
const SENTENCE_BREAK = /(?<![A-Z][a-z]\.)(?<=[.!?…])["'”’)\]]*\s+/g;

function splitOn(text: string, pattern: RegExp): Unit[] {
  const units: Unit[] = [];
  /* A fresh RegExp per call: `lastIndex` on a shared /g literal is state, and
     this function is called once per keystroke on the chunking controls. */
  const re = new RegExp(pattern.source, pattern.flags);
  let start = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    push(units, text, start, match.index);
    start = match.index + match[0].length;
    /* A zero-width match would spin here. It cannot happen with either
       pattern above, but this file is meant to be edited. */
    if (match[0].length === 0) re.lastIndex += 1;
  }
  push(units, text, start, text.length);

  return units.length > 0 ? units : fixedUnits(text, text.length || 1);
}

/** Fixed-width fallback, and the "fixed" strategy itself: cut at `size`, but
 *  back off to the nearest space so a word is never split down the middle. */
function fixedUnits(text: string, size: number): Unit[] {
  const units: Unit[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + size);
    if (end < text.length) {
      const space = text.lastIndexOf(" ", end);
      if (space > start) end = space;
    }
    push(units, text, start, end);
    start = end;
  }
  return units;
}

/**
 * Record a unit, with leading and trailing whitespace walked off the ENDS
 * rather than trimmed out of the middle. This is the one function in the file
 * that keeps the invariant true, so it is the one to read if a highlight ever
 * lands two characters late.
 */
function push(units: Unit[], text: string, start: number, end: number) {
  let from = start;
  let to = end;
  while (from < to && /\s/.test(text[from])) from += 1;
  while (to > from && /\s/.test(text[to - 1])) to -= 1;
  if (to > from) units.push({ start: from, end: to });
}

/**
 * The invariant, as an assertion.
 *
 * Called by /api/ingest in development. It is three lines and it turns the
 * worst bug this template can have — offsets that drift by a few characters,
 * so every highlight lands on the wrong sentence — into a loud failure at
 * ingest time instead of a subtle one in the reading pane.
 */
export function verifyChunks(text: string, chunks: Chunk[]): void {
  for (const chunk of chunks) {
    if (chunk.text !== text.slice(chunk.start, chunk.end)) {
      throw new Error(
        `Chunk ${chunk.id} does not match its offsets (${chunk.start}–${chunk.end}). ` +
          `Something between chunkDocument and here trimmed or rewrote the slice.`,
      );
    }
  }
}

/** How the chunking panel describes what each strategy will do. */
export const STRATEGY_HINTS: Record<ChunkStrategy, string> = {
  paragraph: "Cuts on blank lines. Best default — paragraphs are usually one idea.",
  sentence: "Cuts between sentences. Tighter citations, more chunks, more embedding calls.",
  fixed: "Cuts every N characters at a word boundary. Use when the document has no structure.",
};
