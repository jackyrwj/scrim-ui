"use client";

import * as React from "react";
import { SourceCard } from "@/showcase/source-card/source-card";
import { SourceList, type RetrievedSource } from "@/showcase/source-list/source-list";
import { InlineCitation, type Citation } from "@/showcase/citation-ui/citation-ui";
import { PromptInput } from "@/showcase/prompt-input/prompt-input";
import { ThinkingIndicator } from "@/showcase/thinking-indicator/thinking-indicator";
import { sliceTo, useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The Answer Engine template, answering one question — in the order the
 * answer actually arrives.
 *
 * A search box and a paragraph of text is the demo this page could have been,
 * and it would have hidden the two things the template exists to prove. So
 * the script walks them in order:
 *
 *   1. Sources before tokens. Retrieval finishes before the model starts, and
 *      the UI says so: the passages that will ground the answer are on screen
 *      — cards in the thread, the full candidate list with scores and the
 *      relevance floor in the rail — before the first word of the answer
 *      exists. An answer that cites its sources can only be checked if the
 *      sources were there to be checked against.
 *   2. Citations inline, while streaming. The answer arrives with [n]
 *      markers resolved to chips as the text passes them — each one a popover
 *      quoting the passage it came from, not a filename. (The template's
 *      popover slices the passage out of the corpus by streamed offsets; the
 *      chip here is the site's citation component, since the slicing half is
 *      Pro code.)
 *   3. Follow-ups after the last token. The chips are generated once the
 *      answer settles, so they land late and there is deliberately no
 *      skeleton holding their place.
 *
 * The question is rendered as a heading, not a bubble — this is a search
 * engine, and the question is the title of the result. No model, no corpus,
 * no route behind the frame; stated below rather than left for someone to
 * discover.
 */

/* Mirrors templates/answer-engine/lib/models.ts. A copy, deliberately: the
   template is a standalone app with its own tsconfig, and reaching into it
   from the site would couple the two builds to save four lines. */
const MODELS = [
  { id: "anthropic/claude-sonnet-5", name: "Claude Sonnet 5", hint: "Balanced — the default" },
  { id: "anthropic/claude-opus-5", name: "Claude Opus 5", hint: "Strongest reasoning" },
  { id: "anthropic/claude-fable-5", name: "Claude Fable 5", hint: "Fast and capable" },
  { id: "openai/gpt-5.5", name: "GPT-5.5", hint: "Fast and broad" },
  { id: "google/gemini-3.5-flash", name: "Gemini 3.5 Flash", hint: "Cheapest, long context" },
];

const QUESTION = "When do preview environments expire?";

/* What retrieval returned — including the two candidates that fell under the
   floor and were never sent to the model. The rail shows all four because a
   floor you cannot see is a number somebody guessed. */
const SOURCES: RetrievedSource[] = [
  {
    id: "previews:3",
    title: "Preview environments — Lifecycle",
    passage:
      "A preview environment expires after 14 days without a deployment. Any push to the branch resets the timer.",
    score: 0.912,
  },
  {
    id: "domains:1",
    title: "Custom domains — Behaviour",
    passage:
      "Production domains never expire. An expired preview can be rebuilt on demand from the same commit.",
    score: 0.867,
  },
  {
    id: "billing:2",
    title: "Billing — Build minutes",
    passage:
      "Build minutes are counted per build, including on-demand rebuilds of expired preview environments.",
    score: 0.743,
  },
  {
    id: "cli:7",
    title: "CLI reference — halyard deploy",
    passage: "Pass --prebuilt to skip the build step when re-deploying an existing bundle.",
    score: 0.701,
  },
];

const FLOOR = 0.78;

/* Reserved-domain URLs: the frame links somewhere real-looking without
   pointing at anyone's actual docs. */
const CITATIONS: Record<number, Citation> = {
  1: {
    id: 1,
    title: "Preview environments — Lifecycle",
    url: "https://example.com/docs/previews#lifecycle",
    snippet:
      "A preview environment expires after 14 days without a deployment. Any push to the branch resets the timer.",
  },
  2: {
    id: 2,
    title: "Custom domains — Behaviour",
    url: "https://example.com/docs/domains",
    snippet:
      "Production domains never expire. An expired preview can be rebuilt on demand from the same commit.",
  },
};

/* The answer as the parser sees it: text, with citation numbers where the
   model wrote [n]. Numbers cost no characters — they arrive whole the moment
   the text before them has streamed. */
const ANSWER_PARTS: (string | number)[] = [
  "Preview environments expire after 14 days without a deploy",
  1,
  ". Pushing to the branch resets the clock, so an active pull request's preview never goes stale",
  1,
  ". An expired preview is rebuilt on demand from the same commit — nothing is deleted",
  2,
  ". Production domains are unaffected and never expire",
  2,
  ".",
];

const FOLLOWUPS = [
  "How do I rebuild an expired preview?",
  "Do rebuilds count against build minutes?",
  "Can I change the 14-day expiry?",
];

const EXAMPLE_QUERIES = [
  "When do preview environments expire?",
  "How do I add a custom domain?",
  "What happens if I go over my build minutes?",
  "How do I roll back a broken deploy?",
];

/* The turn, as a sequence of screens. Sources before the first token, chips
   after the last one — the ordering is the feature being shown. */
type Phase = "empty" | "submitted" | "sources" | "answering" | "done";

const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "empty", ms: 1400 },
  { phase: "submitted", ms: 1100 },
  { phase: "sources", ms: 2400 },
  { phase: "answering", ms: 4600 },
  { phase: "done", ms: 5600 },
];

const ORDER: Phase[] = TIMELINE.map((t) => t.phase);
const at = (phase: Phase, min: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(min);

/** Reveal a mixed text/citation stream by character budget, word-boundaried
 *  within the current string via sliceTo. A citation marker is emitted whole
 *  once the text before it has fully streamed — never half a `[1`. */
function revealParts(parts: (string | number)[], ratio: number): (string | number)[] {
  if (ratio >= 1) return parts;
  const total = parts.reduce<number>((n, p) => n + (typeof p === "string" ? p.length : 0), 0);
  let budget = Math.floor(total * ratio);
  const out: (string | number)[] = [];
  for (const p of parts) {
    if (typeof p === "number") {
      out.push(p);
      continue;
    }
    if (budget <= 0) break;
    if (p.length <= budget) {
      out.push(p);
      budget -= p.length;
    } else {
      out.push(sliceTo(p, budget / p.length));
      break;
    }
  }
  /* A marker that only just resolved sits at the cut; trailing chips past the
     revealed text read as arriving early, so drop them. */
  while (out.length > 0 && typeof out[out.length - 1] === "number" && budget <= 0) out.pop();
  return out;
}

export function AnswerEngineDemo({ caption = true }: { caption?: boolean }) {
  const [step, setStep] = React.useState(0);
  /* Tagged with the step it belongs to, so moving on resets the reveal
     without an effect having to zero it. */
  const [progress, setProgress] = React.useState({ step: 0, value: 0 });

  const frameRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  /* Reduced motion gets the settled result: sources, the cited answer, the
     follow-ups — the single most informative frame of the script. */
  const phase = reduced ? "done" : TIMELINE[step].phase;
  const ratio = progress.step === step ? progress.value : 0;
  const status = phase === "submitted" ? "submitted" : phase === "empty" || phase === "done" ? "ready" : "streaming";
  const busy = status !== "ready";

  const playing = inView && !reduced;

  /* The step machine. One timeout per screen, cleared on every change, so
     scrolling away mid-turn cannot leave a stray timer behind. */
  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % TIMELINE.length), TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  /* The answer reveal, driven off elapsed time rather than a per-character
     timer: a tab that was backgrounded resumes at the right place instead of
     finishing a burst of queued ticks. */
  React.useEffect(() => {
    if (!playing || phase !== "answering") return;
    const total = TIMELINE[step].ms;
    const started = performance.now();
    const id = window.setInterval(() => {
      setProgress({ step, value: Math.min(1, (performance.now() - started) / total) });
    }, 40);
    return () => window.clearInterval(id);
  }, [step, phase, playing]);

  /* Follow the thread down as it grows. */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [phase, ratio]);

  function replay() {
    setProgress({ step: 0, value: 0 });
    setStep(0);
  }

  const answerParts = phase === "answering" ? revealParts(ANSWER_PARTS, ratio) : ANSWER_PARTS;
  /* The two passages that cleared the floor, as the thread's source cards. */
  const passed = SOURCES.filter((s) => s.score >= FLOOR);

  return (
    <div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border border-(--border)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Window chrome. The status pill is the part that earns its space:
            it names the useChat state driving whatever is on screen. */}
        <div className="flex items-center gap-3 border-b border-(--border) bg-(--muted) px-3 py-2">
          <div className="flex gap-1.5" aria-hidden>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full opacity-60" style={{ background: c }} />
            ))}
          </div>
          <span className="hidden truncate text-[11px] text-(--muted-foreground) sm:inline">
            localhost:3000
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--border) bg-(--card) px-2 py-0.5 font-mono text-[10px] text-(--muted-foreground)">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: busy ? "var(--primary)" : "#22c55e" }}
              aria-hidden
            />
            status: {status}
          </span>
          <button
            type="button"
            onClick={replay}
            className="shrink-0 rounded-md border border-(--border) bg-(--card) px-2 py-0.5 text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Replay
          </button>
        </div>

        {/* From here down it is the app, in the app's own palette rather than
            the site's — a preview that adopts the surrounding theme tokens
            shows you this page, not the thing you are buying. */}
        <div className="flex h-[26rem] flex-col bg-white text-zinc-900 sm:h-[30rem] dark:bg-zinc-950 dark:text-zinc-100">
          <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
            <span className="text-[13px] font-semibold tracking-tight">Halyard Answers</span>
            <button
              type="button"
              onClick={replay}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              New search
            </button>
          </header>

          <div className="flex min-h-0 flex-1">
            {/* The thread */}
            <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
              {phase === "empty" ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">Ask the Halyard docs</h3>
                    <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-5 text-zinc-500">
                      Answers come only from the bundled corpus. Every claim carries a citation you
                      can open — the passage it came from, not a list of filenames.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {EXAMPLE_QUERIES.map((query) => (
                      <button
                        key={query}
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-full border border-zinc-200 px-3 py-1.5 text-[12px] text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
                  {/* The question is the title of the result, not a bubble —
                      this is a search engine, not a chat. */}
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {QUESTION}
                  </h2>

                  {phase === "submitted" && <ThinkingIndicator />}

                  {at(phase, "sources") && (
                    <>
                      {/* Retrieval answers first: what will ground the answer
                          is on screen before the answer exists. */}
                      <div className="grid gap-2 sm:grid-cols-2">
                        {passed.map((source, i) => (
                          <SourceCard
                            key={source.id}
                            title={source.title}
                            url={CITATIONS[i + 1].url}
                            snippet={source.passage}
                            index={i + 1}
                          />
                        ))}
                      </div>

                      {at(phase, "answering") && (
                        <p className="whitespace-pre-wrap text-[14px] leading-7 text-zinc-800 dark:text-zinc-200">
                          {answerParts.map((part, i) =>
                            typeof part === "string" ? (
                              <React.Fragment key={i}>{part}</React.Fragment>
                            ) : (
                              <InlineCitation key={i} citation={CITATIONS[part]} />
                            ),
                          )}
                          {phase === "answering" && (
                            <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
                          )}
                        </p>
                      )}

                      {/* Chips appear when they land, with no skeleton holding
                          their place — an answer with no chips is a fine
                          answer. */}
                      {phase === "done" && (
                        <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                            Follow up
                          </p>
                          <ul className="space-y-0.5">
                            {FOLLOWUPS.map((question) => (
                              <li key={question}>
                                <button
                                  type="button"
                                  onClick={replay}
                                  className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-[13px] leading-5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                >
                                  <span className="min-w-0">{question}</span>
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    width="13"
                                    height="13"
                                    aria-hidden
                                    className="shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400"
                                  >
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                  </svg>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* The rail: every candidate retrieval considered, with scores and
                the floor, always in view on wide screens. */}
            <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-zinc-200 px-4 py-6 md:block dark:border-zinc-800">
              {at(phase, "sources") ? (
                <SourceList sources={SOURCES} floor={FLOOR} />
              ) : (
                <p className="text-[12px] leading-5 text-zinc-400">
                  Passages the next answer draws on will appear here.
                </p>
              )}
            </aside>
          </div>

          <footer className="shrink-0 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="mx-auto max-w-3xl">
              <PromptInput
                models={MODELS}
                defaultModel={MODELS[0].id}
                placeholder={
                  phase === "empty"
                    ? "Ask about deploys, previews, domains, billing…"
                    : busy
                      ? "Answering…"
                      : "Ask a follow-up…"
                }
                loading={busy}
                onSubmit={replay}
                onStop={replay}
              />
              <p className="mt-2 text-center text-[11px] text-zinc-400">
                Answers come only from the bundled docs. Click any citation to see the passage.
              </p>
            </div>
          </footer>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
          A scripted replay of one question — the source cards, retrieval rail, citation chips and
          composer above are the real components the template ships, mounted here, but there is no
          corpus or model behind this page. The ordering is the feature: sources land before the
          first answer token, citations resolve inline as the answer streams past them, and the
          follow-up chips arrive only after the last token. The template you download talks to your
          corpus and your gateway key.
        </p>
      )}
    </div>
  );
}
