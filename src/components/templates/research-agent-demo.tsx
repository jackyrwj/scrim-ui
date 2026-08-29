"use client";

import * as React from "react";
import { AgentPlan, type PlanStep } from "@/showcase/agent-plan/agent-plan";
import { AgentRunTimeline, type RunEvent } from "@/showcase/agent-run-timeline/agent-run-timeline";
import { SourceList, type RetrievedSource } from "@/showcase/source-list/source-list";
import { InlineCitation, type Citation } from "@/showcase/citation-ui/citation-ui";
import { PromptInput } from "@/showcase/prompt-input/prompt-input";
import { ThinkingIndicator } from "@/showcase/thinking-indicator/thinking-indicator";
import { sliceTo, useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The Research Agent template, playing one run end to end.
 *
 * The template's claim is that a research run is four stages, not one
 * streaming answer: a planner decomposes the question, parallel researchers
 * dig through the bundled corpus, the retrieved passages are shown with the
 * relevance floor visible, and only then does the synthesizer write the
 * cited report. A demo that jumped from question to report would skip the
 * three stages that are the actual product, so the timeline walks them all:
 * plan appears, researcher rows light up and settle in the run timeline,
 * the source list fills in, and the report streams in behind it with its
 * citations resolving as they arrive.
 *
 * The beat worth reading twice is researcher 3. It fails — the search
 * backend returns a 503 — while the other three succeed. That is the
 * template's honest-failure selling point: the row turns red and stays in
 * the plan, the run does not stop, and the report says out loud which
 * sub-question it could not answer rather than papering over the gap. A
 * demo where everything succeeds would be a demonstration of the opposite
 * feature.
 *
 * What this is NOT is a live pipeline. There is no key on this page, no
 * planner, no corpus index — the events, scores and prose are scripted,
 * which is stated under the frame rather than left for someone to
 * discover. The components are the real ones the template ships. The
 * citation chips are the site's citation-ui standing in for the template's
 * citation popover, which is a Pro component and not mounted here.
 */

/* Mirrors templates/research-agent/lib/models.ts. A copy, deliberately:
   the template is a standalone app with its own tsconfig, and reaching
   into it from the site would couple the two builds to save six lines. */
const MODELS = [
  { id: "anthropic/claude-sonnet-5", name: "Claude Sonnet 5", hint: "Balanced — the default" },
  { id: "anthropic/claude-opus-5", name: "Claude Opus 5", hint: "Strongest synthesis" },
  { id: "openai/gpt-5.5", name: "GPT-5.5", hint: "Fast and broad" },
  { id: "google/gemini-3.5-flash", name: "Gemini 3.5 Flash", hint: "Cheapest, long context" },
];

const QUESTION =
  "What happens to write latency when I raise the replication factor to 3, and what can I tune to get it back?";

/* The plan, in the order the planner would emit it. Sub-question 3 is the
   one whose researcher fails — mid-list, where the red row is visible. */
const SUB_QUESTIONS = [
  "How does the replication factor change the write path?",
  "What latency impact does RF=3 have in the benchmarks?",
  "What are the consistency trade-offs of the tuning knobs?",
  "Which settings recover write latency at RF=3?",
];

const SOURCES: RetrievedSource[] = [
  {
    id: "s1",
    title: "replication.md — Write path",
    passage:
      "With replication factor 3, every write is acknowledged by the leader and two followers before it returns, so p99 write latency tracks the slowest follower.",
    score: 0.874,
  },
  {
    id: "s2",
    title: "benchmarks.md — RF=2 vs RF=3",
    passage:
      "Raising RF from 2 to 3 moved p99 write latency from 11ms to 23ms on the reference cluster; p50 was unchanged.",
    score: 0.731,
  },
  {
    id: "s3",
    title: "tuning.md — Batching and acks",
    passage:
      "write.batch_size and the follower ack_timeout recover most of the RF=3 penalty; a batch size of 64 returned p99 to 14ms.",
    score: 0.662,
  },
  /* Below the floor: considered, not sent to the model. The floor being
     visible is what separates "nothing relevant was found" from "the model
     made this up". */
  {
    id: "s4",
    title: "glossary.md — Quorum",
    passage: "A quorum is the minimum number of replicas that must acknowledge a write.",
    score: 0.418,
  },
];

const CITATIONS: Citation[] = [
  {
    id: 1,
    title: "replication.md — Write path",
    url: "#",
    domain: "bundled docs",
    snippet:
      "…every write is acknowledged by the leader and two followers before it returns, so p99 write latency tracks the slowest follower.",
  },
  {
    id: 2,
    title: "benchmarks.md — RF=2 vs RF=3",
    url: "#",
    domain: "bundled docs",
    snippet: "…p99 write latency moved from 11ms to 23ms on the reference cluster; p50 was unchanged.",
  },
  {
    id: 3,
    title: "tuning.md — Batching and acks",
    url: "#",
    domain: "bundled docs",
    snippet: "…a batch size of 64 returned p99 to 14ms.",
  },
];

/* The report as segments, so citations stay chips at every point in the
   reveal rather than flickering as half-typed "[2" text. */
type Segment = { t: "text"; text: string } | { t: "cite"; n: number };

const REPORT: Segment[] = [
  {
    t: "text",
    text: "Raising the replication factor to 3 puts a third acknowledgement on the write path: every write now waits for the leader and two followers, so p99 latency tracks the slowest follower rather than the median one",
  },
  { t: "cite", n: 1 },
  {
    t: "text",
    text: ". In the reference benchmarks that moved p99 write latency from 11ms to 23ms, while p50 was effectively unchanged",
  },
  { t: "cite", n: 2 },
  {
    t: "text",
    text: ".\n\nTo get it back, raise write.batch_size (64 returned p99 to 14ms in the same benchmarks) and tune the follower ack_timeout so one slow follower does not hold every write",
  },
  { t: "cite", n: 3 },
  {
    t: "text",
    text: ".\n\nOne gap, honestly: the sub-question on consistency trade-offs failed mid-run — its researcher's search backend returned a 503 — so this report covers latency only. Re-run the question to fill that in.",
  },
];

const REPORT_CHARS = REPORT.reduce((n, s) => (s.t === "text" ? n + s.text.length : n), 0);

/* ------------------------------------------------------------------ */
/* The script                                                          */
/* ------------------------------------------------------------------ */

type Phase = "asked" | "planned" | "r1" | "r2" | "r3" | "gathered" | "report" | "done";

/* Durations are the pacing of the replay, not of a real pipeline: long
   enough to read what changed, short enough that the loop comes back
   around while someone is still on the page. */
const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "asked", ms: 1100 },
  { phase: "planned", ms: 1800 },
  { phase: "r1", ms: 2200 },
  { phase: "r2", ms: 2000 },
  { phase: "r3", ms: 2100 },
  { phase: "gathered", ms: 1500 },
  { phase: "report", ms: 4800 },
  { phase: "done", ms: 6400 },
];

/** What the chrome pill says on each screen — the run's stage, since the
 *  staged pipeline is the thing being sold. */
function pillFor(phase: Phase): string {
  if (phase === "asked" || phase === "planned") return "planning";
  if (phase === "report") return "synthesizing";
  if (phase === "done") return "ready";
  return "researching";
}

/** The plan's per-step states at each screen. Done steps never move; the
 *  failed one stays in the list, red, with the reason. */
function planFor(phase: Phase): PlanStep[] {
  const states: Record<Phase, [PlanStep["state"], PlanStep["state"], PlanStep["state"], PlanStep["state"]]> = {
    asked: ["pending", "pending", "pending", "pending"],
    planned: ["pending", "pending", "pending", "pending"],
    r1: ["active", "active", "pending", "pending"],
    r2: ["done", "active", "active", "pending"],
    r3: ["done", "done", "failed", "active"],
    gathered: ["done", "done", "failed", "done"],
    report: ["done", "done", "failed", "done"],
    done: ["done", "done", "failed", "done"],
  };
  const notes: (string | undefined)[] = [
    phase === "r2" || phase === "r3" || phase === "gathered" || phase === "report" || phase === "done"
      ? "4 passages cited"
      : undefined,
    phase === "r3" || phase === "gathered" || phase === "report" || phase === "done"
      ? "3 passages cited"
      : undefined,
    states[phase][2] === "failed" ? "Search backend 503 — synthesis will note the gap" : undefined,
    phase === "gathered" || phase === "report" || phase === "done" ? "2 passages cited" : undefined,
  ];
  return SUB_QUESTIONS.map((text, i) => ({
    id: `q${i + 1}`,
    text,
    state: states[phase][i],
    note: notes[i],
  }));
}

/* Run-timeline events, cumulative per screen. Display timestamps are props,
   so the clock is scripted with everything else. */
const E1_RUN: RunEvent = { id: "e1", kind: "model", title: "Researcher 1 — the write path under RF", detail: "replication.md, writes.md", at: "14:02:07", status: "running" };
const E2_RUN: RunEvent = { id: "e2", kind: "model", title: "Researcher 2 — RF=3 latency benchmarks", detail: "benchmarks.md", at: "14:02:07", status: "running" };
const E3_RUN: RunEvent = { id: "e3", kind: "model", title: "Researcher 3 — consistency trade-offs", detail: "consistency.md, tuning.md", at: "14:02:09", status: "running" };
const E4_RUN: RunEvent = { id: "e4", kind: "model", title: "Researcher 4 — tuning knobs at RF=3", detail: "tuning.md", at: "14:02:12", status: "running" };
const SYNTH_RUN: RunEvent = { id: "e5", kind: "model", title: "Synthesizing the report", detail: "Claude Sonnet 5", at: "14:02:15", status: "running" };

const E1_DONE: RunEvent = { ...E1_RUN, status: "completed", durationMs: 3100 };
const E2_DONE: RunEvent = { ...E2_RUN, status: "completed", durationMs: 4200 };
/* A failure is an event, not an absence: the row stays, red, with the
   reason the synthesizer will quote. */
const E3_FAILED: RunEvent = { ...E3_RUN, status: "failed", detail: "Search backend returned 503 — no passages retrieved" };
const E4_DONE: RunEvent = { ...E4_RUN, status: "completed", durationMs: 2600 };
const SYNTH_DONE: RunEvent = { ...SYNTH_RUN, status: "completed", durationMs: 2900 };

function eventsFor(phase: Phase): RunEvent[] {
  switch (phase) {
    case "r1":
      return [E1_RUN, E2_RUN];
    case "r2":
      return [E1_DONE, E2_RUN, E3_RUN];
    case "r3":
      return [E1_DONE, E2_DONE, E3_FAILED, E4_RUN];
    case "gathered":
    case "report":
      return [E1_DONE, E2_DONE, E3_FAILED, E4_DONE, SYNTH_RUN];
    case "done":
      return [E1_DONE, E2_DONE, E3_FAILED, E4_DONE, SYNTH_DONE];
    default:
      return [];
  }
}

/* ------------------------------------------------------------------ */
/* The demo                                                            */
/* ------------------------------------------------------------------ */

export function ResearchAgentDemo({ caption = true }: { caption?: boolean }) {
  const [step, setStep] = React.useState(0);
  /* Tagged with the step it belongs to, so moving on resets the report
     reveal without an effect having to zero it. */
  const [progress, setProgress] = React.useState({ step: 0, value: 0 });

  const frameRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  /* Reduced motion gets the finished run: plan settled (including the red
     row), sources listed, report complete. The failure is the content, and
     it survives being still. */
  const phase: Phase = reduced ? "done" : TIMELINE[step].phase;
  const ratio = progress.step === step ? progress.value : 0;
  const busy = phase !== "done";

  const playing = inView && !reduced;

  /* The step machine. One timeout per screen, cleared on every change, so
     scrolling away mid-run cannot leave a stray timer behind. */
  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % TIMELINE.length), TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  /* The report reveal. Driven off elapsed time rather than a per-character
     timer: a tab that was backgrounded resumes at the right place instead
     of finishing a burst of queued ticks. */
  React.useEffect(() => {
    if (!playing || phase !== "report") return;
    const total = TIMELINE[step].ms;
    const started = performance.now();
    const id = window.setInterval(() => {
      setProgress({ step, value: Math.min(1, (performance.now() - started) / total) });
    }, 40);
    return () => window.clearInterval(id);
  }, [step, phase, playing]);

  /* Follow the thread down as it grows, exactly as research.tsx does. */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [phase, ratio]);

  function replay() {
    setProgress({ step: 0, value: 0 });
    setStep(0);
  }

  const events = eventsFor(phase);
  const sourcesShown = phase === "gathered" || phase === "report" || phase === "done";
  const reportShown = phase === "report" || phase === "done";
  const reportRatio = phase === "done" ? 1 : ratio;

  return (
    <div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border border-(--border)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Window chrome. The pill names the pipeline stage driving
            whatever is on screen. */}
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
            status: {pillFor(phase)}
          </span>
          <button
            type="button"
            onClick={replay}
            className="shrink-0 rounded-md border border-(--border) bg-(--card) px-2 py-0.5 text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Replay
          </button>
        </div>

        {/* From here down it is the app, in the app's own palette rather
            than the site's. The layout mirrors the template's run view:
            thread on the left, sources rail on wide screens, composer
            pinned to the footer. */}
        <div className="flex h-[26rem] flex-col bg-white text-zinc-900 sm:h-[30rem] dark:bg-zinc-950 dark:text-zinc-100">
          <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
            <span className="text-[13px] font-semibold tracking-tight">Tideline Research</span>
            <button
              type="button"
              onClick={replay}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              New research
            </button>
          </header>

          <div className="flex min-h-0 flex-1">
            {/* The thread */}
            <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {QUESTION}
                </h2>

                {/* The plan panel. Before the planner returns this is the
                    thinking indicator; once data-plan lands it is the
                    checklist the run then annotates. */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                  {phase === "asked" ? (
                    <ThinkingIndicator label="Planning the research" />
                  ) : (
                    <AgentPlan title="Research plan" steps={planFor(phase)} />
                  )}
                </div>

                {/* The activity log. Rows appear as the parallel researchers
                    start and settle — including the one that fails. */}
                {events.length > 0 && (
                  <AgentRunTimeline
                    events={events}
                    className="max-h-52"
                    summary={
                      phase === "done"
                        ? { elapsed: "12.4s", tokens: 12980, cost: "$0.0412" }
                        : undefined
                    }
                  />
                )}

                {/* The report, streaming in behind the timeline with its
                    citations as chips — never as half-typed markers. */}
                {reportShown && (
                  <div className="whitespace-pre-wrap text-[14px] leading-6 text-zinc-800 dark:text-zinc-200">
                    <ReportBody ratio={reportRatio} />
                    {phase === "report" && (
                      <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
                    )}
                  </div>
                )}

                {/* Inline sources for narrow screens, where the rail is
                    hidden — only once settled, as the template does it. */}
                {phase === "done" && (
                  <div className="lg:hidden">
                    <SourceList sources={SOURCES} floor={0.5} />
                  </div>
                )}
              </div>
            </div>

            {/* The sources rail: the run's retrieved passages, floor
                visible, always in view on wide screens. */}
            <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-zinc-200 px-4 py-6 lg:block dark:border-zinc-800">
              {sourcesShown ? (
                <SourceList sources={SOURCES} floor={0.5} />
              ) : (
                <p className="text-[12px] leading-5 text-zinc-400">
                  Passages the researchers cite will appear here as the run settles.
                </p>
              )}
            </aside>
          </div>

          <footer className="shrink-0 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="mx-auto max-w-3xl">
              <PromptInput
                models={MODELS}
                defaultModel={MODELS[0].id}
                placeholder={busy ? "Researching…" : "Ask another hard question…"}
                loading={busy}
                onSubmit={replay}
                onStop={replay}
              />
              <p className="mt-2 text-center text-[11px] text-zinc-400">
                Reports cite only the bundled docs. Hover any citation to see the passage.
              </p>
            </div>
          </footer>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
          A scripted replay of one research run — plan, four parallel researchers (one{" "}
          <strong className="font-medium text-(--foreground)">fails</strong>, and the report says
          which question it could not answer), retrieved sources with the floor visible, then the
          cited report. The components are the real ones the template ships, but there is no model,
          planner or corpus behind this page.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The report reveal                                                    */
/* ------------------------------------------------------------------ */

/* Characters are the budget; citation chips cost nothing and appear once
   the text they hang off has fully arrived. Word-boundary slicing (sliceTo)
   keeps the stream from looking corrupted mid-word. */
function ReportBody({ ratio }: { ratio: number }) {
  const budget = Math.floor(REPORT_CHARS * ratio);
  /* The character offset where each segment starts, computed up front so
     the render map carries no mutable accumulator through its closure. */
  const starts: number[] = [];
  let at = 0;
  for (const s of REPORT) {
    starts.push(at);
    if (s.t === "text") at += s.text.length;
  }
  return (
    <>
      {REPORT.map((segment, i) => {
        const remaining = budget - starts[i];
        if (remaining <= 0) return null;
        if (segment.t === "cite") {
          return <InlineCitation key={i} citation={CITATIONS[segment.n - 1]} />;
        }
        return (
          <React.Fragment key={i}>
            {sliceTo(segment.text, Math.min(1, remaining / segment.text.length))}
          </React.Fragment>
        );
      })}
    </>
  );
}
