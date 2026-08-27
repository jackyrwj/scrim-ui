"use client";

import * as React from "react";
import { PromptInput } from "@/showcase/prompt-input/prompt-input";
import { ThinkingIndicator } from "@/showcase/thinking-indicator/thinking-indicator";

/**
 * The RAG template, answering one question.
 *
 * The claim on this page is a specific one — citations that land on the
 * sentence, not a list of filenames at the bottom — and it is a claim you
 * cannot make in a bullet point, because the whole of it is an interaction.
 * So this frame is the interaction: an answer streaming in with its citations
 * resolving as they arrive, and clicking one marking the passage in the
 * document beside it. **The chips below are live.** Click one.
 *
 * Two honest differences from the ai-chat demo above it.
 *
 * There is no model behind this page — same as that one, and stated under the
 * frame rather than left to be discovered. The turn is scripted.
 *
 * And unlike that one, this cannot mount the components it is demonstrating.
 * The chat template's `components/ui/*` are byte-identical to the ones under
 * src/showcase, so its demo mounts the real files. The citation chip, the
 * reading pane and the source list exist only inside templates/rag-qa, which
 * is a standalone app with its own tsconfig — importing across that boundary
 * would couple two builds to save a hundred lines. So what follows is a
 * mirror, the same way the MODELS array in ai-chat-demo.tsx is a copy. When
 * the citation popover ships as a Pro component of its own, this file should
 * import that instead of redrawing it.
 *
 * The one thing it does NOT mirror is the streaming citation parser. That is
 * the interesting code, it is forty lines, and reimplementing it here would
 * be maintaining the hard part twice. The replay reveals text on word
 * boundaries and reveals a marker whole, which produces the same thing on
 * screen — no flicker — without pretending to be the same mechanism.
 */

/* No hard wraps inside a paragraph. The pane is `whitespace-pre-wrap`, so
   authored line breaks survive into a column narrower than they were written
   for and come out as a ragged half-line after every sentence — which reads
   as a layout bug rather than as a document. Blank lines between paragraphs
   are real structure and stay. */
const DOCUMENT = `# Q3 board summary

Revenue rose 14% in Q3, to $4.2m. Growth came almost entirely from the enterprise tier, where seat expansion outpaced new logos for the second quarter running.

Gross margin fell to 61%, down from 68%. The new data centre contract lands in full this quarter, and we expect the step change to persist through Q4 before amortising.

Headcount was flat at 84. We plan six engineering hires before year end, weighted towards the platform team.`;

const QUESTION = "Why did margin fall, and is it permanent?";

/* Offsets into DOCUMENT, exactly as the template's sources carry them — the
   passages here are `DOCUMENT.slice(start, end)` and nothing else, which is
   the same discipline the template's lib/chunk.ts enforces. Written as a
   find() rather than as two numbers, because hand-counted offsets are wrong
   the first time someone edits a word above. */
const PASSAGES = [
  { n: 1, from: "Gross margin fell to 61%", to: "before amortising.", score: 0.612 },
  { n: 2, from: "Revenue rose 14% in Q3", to: "quarter running.", score: 0.341 },
].map(({ n, from, to, score }) => {
  const start = DOCUMENT.indexOf(from);
  const end = DOCUMENT.indexOf(to) + to.length;
  return { n, start, end, score, text: DOCUMENT.slice(start, end) };
});

type Passage = (typeof PASSAGES)[number];

/* The answer, as alternating prose and markers. Split at authoring time
   rather than parsed at runtime — see the note above about not maintaining
   the parser twice. */
const ANSWER: ({ text: string } | { cite: number })[] = [
  { text: "Margin fell to 61% from 68% because the new data centre contract lands in full this quarter" },
  { cite: 1 },
  { text: ". Not permanent, but not brief either — the summary expects the step change to persist through Q4 before it amortises" },
  { cite: 1 },
  { text: ". Revenue is not the cause: it rose 14% over the same period" },
  { cite: 2 },
  { text: "." },
];

const ANSWER_LENGTH = ANSWER.reduce((n, part) => n + ("text" in part ? part.text.length : 4), 0);

type Phase = "empty" | "retrieving" | "sources" | "answering" | "done";

const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "empty", ms: 1000 },
  { phase: "retrieving", ms: 1400 },
  { phase: "sources", ms: 1100 },
  { phase: "answering", ms: 4200 },
  { phase: "done", ms: 6000 },
];

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Read during render rather than copied into state by an effect — same
 *  reasoning as ai-chat-demo.tsx. */
function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

export function RagQaDemo({ caption = true }: { caption?: boolean }) {
  const [step, setStep] = React.useState(0);
  const [inView, setInView] = React.useState(false);
  const [progress, setProgress] = React.useState({ step: 0, value: 0 });
  const [active, setActive] = React.useState<Passage>();

  const frameRef = React.useRef<HTMLDivElement>(null);
  const docRef = React.useRef<HTMLDivElement>(null);
  const markRefs = React.useRef(new Map<number, HTMLElement>());

  const reduced = useReducedMotion();
  const phase = reduced ? "done" : TIMELINE[step].phase;
  const ratio = progress.step === step ? progress.value : 0;

  /* Nothing runs off-screen. An animation nobody is looking at is a timer
     nobody asked for — the same rule the component cards follow. */
  React.useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = inView && !reduced;

  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % TIMELINE.length), TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  /* Elapsed-time driven, not a per-character timer: a backgrounded tab
     resumes at the right place instead of firing a burst of queued ticks. */
  React.useEffect(() => {
    if (!playing || phase !== "answering") return;
    const total = TIMELINE[step].ms;
    const started = performance.now();
    const id = window.setInterval(() => {
      setProgress({ step, value: Math.min(1, (performance.now() - started) / total) });
    }, 40);
    return () => window.clearInterval(id);
  }, [step, phase, playing]);

  /* The interaction the page is actually selling. Scroll the document to the
     passage the reader clicked — inside the frame, never the page. */
  React.useEffect(() => {
    if (!active) return;
    const mark = markRefs.current.get(active.n);
    const scroller = docRef.current;
    if (!mark || !scroller) return;
    const offset = mark.offsetTop - scroller.clientHeight / 2 + mark.clientHeight / 2;
    scroller.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
  }, [active]);

  function replay() {
    setActive(undefined);
    setProgress({ step: 0, value: 0 });
    setStep(0);
  }

  const showSources = phase === "sources" || phase === "answering" || phase === "done";
  const revealed = phase === "answering" ? Math.floor(ANSWER_LENGTH * ratio) : ANSWER_LENGTH;
  const answerParts = phase === "answering" || phase === "done" ? revealTo(ANSWER, revealed) : [];
  const busy = phase === "retrieving" || phase === "sources" || phase === "answering";

  /* Highlights are drawn only for passages the answer has actually cited so
     far, so the document fills in as the reader watches — which is the point
     being made, not a flourish. */
  const cited = new Set(answerParts.flatMap((p) => ("cite" in p ? [p.cite] : [])));
  const marked = PASSAGES.filter((p) => cited.has(p.n));

  return (
    <div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border border-(--border)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-3 border-b border-(--border) bg-(--muted) px-3 py-2">
          <div className="flex gap-1.5" aria-hidden>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full opacity-60" style={{ background: c }} />
            ))}
          </div>
          <span className="hidden truncate text-[11px] text-(--muted-foreground) sm:inline">
            q3-board-summary.md
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--border) bg-(--card) px-2 py-0.5 font-mono text-[10px] text-(--muted-foreground)">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: busy ? "var(--primary)" : "#22c55e" }}
              aria-hidden
            />
            {phaseLabel(phase)}
          </span>
          <button
            type="button"
            onClick={replay}
            className="shrink-0 rounded-md border border-(--border) bg-(--card) px-2 py-0.5 text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Replay
          </button>
        </div>

        {/* The app's own palette, not the site's — a preview that adopts the
            surrounding theme shows you this page, not the thing being sold. */}
        <div className="flex h-[26rem] bg-white text-zinc-900 sm:h-[30rem] dark:bg-zinc-950 dark:text-zinc-100">
          {/* The document. Hidden on the narrowest screens, where two panes
              would leave neither readable — the template uses tabs there. */}
          <div className="hidden min-w-0 flex-1 flex-col border-r border-zinc-200 sm:flex dark:border-zinc-800">
            <div className="shrink-0 border-b border-zinc-200 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800">
              q3-board-summary.md · {DOCUMENT.length} chars · 3 chunks
            </div>
            <div ref={docRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <div className="whitespace-pre-wrap font-mono text-[11.5px] leading-6 text-zinc-700 dark:text-zinc-300">
                {cutDocument(DOCUMENT, marked).map((piece, i) =>
                  piece.n === undefined ? (
                    <React.Fragment key={i}>{piece.text}</React.Fragment>
                  ) : (
                    <mark
                      key={i}
                      ref={(el) => {
                        if (el) markRefs.current.set(piece.n!, el);
                        else markRefs.current.delete(piece.n!);
                      }}
                      data-active={active?.n === piece.n ? "" : undefined}
                      className="rounded-[3px] bg-amber-100/70 px-px text-zinc-900 transition-colors data-active:bg-amber-300 data-active:ring-2 data-active:ring-amber-400/60 dark:bg-amber-400/15 dark:text-zinc-100 dark:data-active:bg-amber-400/40"
                    >
                      {piece.text}
                    </mark>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* The answer. */}
          <div className="flex min-w-0 flex-1 flex-col sm:max-w-[22rem]">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {phase === "empty" ? (
                <p className="pt-16 text-center text-[12px] text-zinc-500">
                  Ask the document something.
                </p>
              ) : (
                <>
                  <div className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-3 py-1.5 text-[12px] leading-5 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                      {QUESTION}
                    </p>
                  </div>

                  {phase === "retrieving" && <ThinkingIndicator />}

                  {answerParts.length > 0 && (
                    <p className="text-[12.5px] leading-6 text-zinc-800 dark:text-zinc-200">
                      {answerParts.map((part, i) =>
                        "text" in part ? (
                          <React.Fragment key={i}>{part.text}</React.Fragment>
                        ) : (
                          <Chip
                            key={i}
                            passage={PASSAGES.find((p) => p.n === part.cite)!}
                            onSelect={setActive}
                          />
                        ),
                      )}
                      {phase === "answering" && (
                        <span
                          className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500"
                          aria-hidden
                        />
                      )}
                    </p>
                  )}

                  {showSources && (
                    <div>
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                        {/* The count the template shows: retrieved is not the
                            same as used, and saying so is the difference
                            between a source list and a source claim. */}
                        {marked.length} of {PASSAGES.length} passages cited
                      </p>
                      <ul className="space-y-1">
                        {PASSAGES.map((passage) => (
                          <li key={passage.n}>
                            <button
                              type="button"
                              onClick={() => setActive(passage)}
                              aria-label={`Passage ${passage.n} — mark it in the document`}
                              data-active={active?.n === passage.n ? "" : undefined}
                              className="flex w-full gap-1.5 rounded-lg border border-transparent px-1.5 py-1 text-left transition-colors hover:bg-zinc-100 data-active:border-amber-300 data-active:bg-amber-50 dark:hover:bg-zinc-900 dark:data-active:border-amber-500/40 dark:data-active:bg-amber-950/30"
                            >
                              <span
                                className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-medium tabular-nums ${
                                  cited.has(passage.n)
                                    ? "bg-amber-100 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200"
                                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                                }`}
                              >
                                {passage.n}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="line-clamp-2 text-[10.5px] leading-4 text-zinc-600 dark:text-zinc-400">
                                  {passage.text}
                                </span>
                                <span className="mt-0.5 block text-[9.5px] tabular-nums text-zinc-400">
                                  {passage.score.toFixed(3)}
                                  {!cited.has(passage.n) && " · not cited"}
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="shrink-0 border-t border-zinc-200 px-2.5 py-2.5 dark:border-zinc-800">
              <PromptInput
                placeholder={busy ? "Answering…" : "Ask about this document…"}
                loading={busy}
                onSubmit={replay}
                onStop={replay}
              />
            </div>
          </div>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
          A scripted replay — there is no model behind this page. The citations are live, though:
          click one, or a row in the source list, and the passage is marked in the document. That is
          the interaction the template ships, driven by chunk offsets carried all the way from
          ingestion.
        </p>
      )}
    </div>
  );
}

/** The citation chip. Click to mark the passage; hover for the text. */
function Chip({ passage, onSelect }: { passage: Passage; onSelect: (passage: Passage) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(passage)}
      title={passage.text}
      aria-label={`Source ${passage.n} — mark it in the document`}
      className="mx-0.5 inline-flex h-[1.35em] min-w-[1.35em] items-center justify-center rounded-[0.3em] bg-amber-100 px-[0.3em] align-[-0.1em] text-[0.75em] font-medium text-amber-900 tabular-nums transition-colors hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500 dark:bg-amber-400/20 dark:text-amber-200 dark:hover:bg-amber-400/30"
    >
      {passage.n}
    </button>
  );
}

function phaseLabel(phase: Phase): string {
  if (phase === "retrieving") return "retrieving";
  if (phase === "sources") return "sources sent";
  if (phase === "answering") return "streaming";
  return "ready";
}

/**
 * Reveal up to `n` characters, counting a marker as four and never splitting
 * one. Text is cut on word boundaries — mid-word cuts read as corruption
 * rather than as arrival, which is the opposite of the impression wanted.
 */
function revealTo(
  parts: ({ text: string } | { cite: number })[],
  n: number,
): ({ text: string } | { cite: number })[] {
  const out: ({ text: string } | { cite: number })[] = [];
  let budget = n;
  for (const part of parts) {
    if (budget <= 0) break;
    if ("cite" in part) {
      if (budget < 4) break;
      budget -= 4;
      out.push(part);
      continue;
    }
    if (part.text.length <= budget) {
      out.push(part);
      budget -= part.text.length;
    } else {
      const space = part.text.lastIndexOf(" ", budget);
      out.push({ text: part.text.slice(0, space > 0 ? space : budget) });
      budget = 0;
    }
  }
  return out;
}

/** The document as alternating plain and marked pieces. Non-overlapping by
 *  construction here — the template's version merges overlaps, which this
 *  fixture does not have. */
function cutDocument(text: string, passages: Passage[]): { text: string; n?: number }[] {
  const sorted = [...passages].sort((a, b) => a.start - b.start);
  const pieces: { text: string; n?: number }[] = [];
  let cursor = 0;
  for (const passage of sorted) {
    if (passage.start > cursor) pieces.push({ text: text.slice(cursor, passage.start) });
    pieces.push({ text: text.slice(passage.start, passage.end), n: passage.n });
    cursor = passage.end;
  }
  if (cursor < text.length) pieces.push({ text: text.slice(cursor) });
  return pieces;
}
