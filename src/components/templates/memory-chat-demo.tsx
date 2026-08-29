"use client";

import * as React from "react";
import { MemoryList } from "@/showcase/memory-list/memory-list";
import { MemoryChip } from "@/showcase/memory-chip/memory-chip";
import { MemoryToast } from "@/showcase/memory-toast/memory-toast";
import { ApprovalRequest } from "@/showcase/approval-request/approval-request";
import { ThinkingIndicator } from "@/showcase/thinking-indicator/thinking-indicator";
import { sliceTo, useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The Memory Chat template, playing the one turn that sells it.
 *
 * A memory feature's whole value is the gate: the model PROPOSES, the user
 * disposes, and nothing is stored before the click. A demo that opened with
 * facts already in the panel would be demonstrating a different, worse
 * product — silent memory. So the timeline walks the real sequence the
 * template ships: the user mentions a preference, the model proposes a write
 * (approval card, amber, with buttons), the approval lands (toast as the
 * receipt, the fact visibly appearing in the panel), and then a second,
 * ordinary question whose answer is quietly shaped by what was remembered.
 * The last beat is the payoff: memory that never changes an answer is a
 * database, not a feature.
 *
 * The gate is scripted, not live — the loop has to come back around on its
 * own, so the pending card resolves itself after a few seconds (approved,
 * the path that shows the full arc). The Allow and Deny buttons are wired
 * anyway: Allow skips the wait, Deny shows the declined card and the
 * un-shaped answer, because a button that does nothing on a page about
 * consent would be a strange thing to ship. Both branches reconverge on the
 * follow-up question; only the answer text and the panel differ.
 *
 * No model, no key, no route. The caption under the frame says so, rather
 * than leaving it for someone to discover.
 */

/* The fact the model proposes, in the shape the template's save_memory tool
   takes it. Shown as the approval card's detail because an approval decision
   is made on exactly this field. */
const FACT = "Prefers vegetarian recipes";

const QUESTION_1 = "Quick heads-up: I'm vegetarian. Keep that in mind for recipe ideas?";

const QUESTION_2 = "What should I cook tonight?";

/* Two answers for the same question, one per decision — the difference
   between them is the feature, so the demo states it in prose rather than
   asserting it in a bullet. */
const ANSWER_REMEMBERED =
  "How about a mushroom and spinach risotto? It's a one-pan vegetarian dinner — arborio rice, mushrooms, a handful of spinach at the end, about 30 minutes. If you want faster, a chickpea curry over rice is 20 minutes and entirely pantry staples.";

const ANSWER_GENERIC =
  "Happy to suggest something — any cuisine you're in the mood for, and how much time do you have? If you want a default: a quick chicken stir-fry is 20 minutes, or a mushroom risotto if you'd rather keep it meat-free.";

const PROPOSAL_DETAIL = `{
  "fact": "${FACT}"
}`;

type Phase =
  | "empty"
  | "asked"
  | "proposed"
  | "resolved"
  | "secondAsk"
  | "answering"
  | "done";

/* The turn, as a sequence of screens. Durations are the pacing of the
   replay, not of a real model: the gate holds longest, because it is the
   screen the template exists to show. */
const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "empty", ms: 1000 },
  { phase: "asked", ms: 1300 },
  { phase: "proposed", ms: 4200 },
  { phase: "resolved", ms: 2800 },
  { phase: "secondAsk", ms: 1600 },
  { phase: "answering", ms: 4200 },
  { phase: "done", ms: 5600 },
];

/** What the status pill should say on each screen — the useChat state, plus
 *  the one addition this template makes to it. */
function statusFor(phase: Phase): string {
  switch (phase) {
    case "empty":
    case "done":
      return "ready";
    case "asked":
    case "secondAsk":
      return "submitted";
    case "proposed":
      return "waiting on you";
    default:
      return "streaming";
  }
}

export function MemoryChatDemo({ caption = true }: { caption?: boolean }) {
  const [step, setStep] = React.useState(0);
  /* null until the gate resolves — by timeout (approved, the scripted
     default) or by click (either way). Reset with the loop. */
  const [decision, setDecision] = React.useState<"approved" | "denied" | null>(null);
  /* Tagged with the step it belongs to, so moving on resets the reveal
     without an effect having to zero it. */
  const [progress, setProgress] = React.useState({ step: 0, value: 0 });

  const frameRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);

  /* Reduced motion gets the finished arc — approved, remembered, and the
     answer it shaped — with nothing moving. The point of the frame is what
     the app looks like, and that survives being still. */
  const phase = reduced ? "done" : TIMELINE[step].phase;
  const resolvedDecision = reduced ? "approved" : (decision ?? "approved");
  const ratio = progress.step === step ? progress.value : 0;
  const status = statusFor(phase);
  const busy = status !== "ready";

  const playing = inView && !reduced;

  /* The step machine. One timeout per screen, cleared on every change, so
     scrolling away mid-turn cannot leave a stray timer behind. The gate is
     on the same clock as everything else — unlike agent-console, this demo
     loops unattended, so the card cannot wait forever. */
  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => {
      setStep((s) => {
        const next = (s + 1) % TIMELINE.length;
        if (next === 0) setDecision(null);
        return next;
      });
    }, TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  /* The reveal for the streamed answer. Driven off elapsed time rather than
     a per-character timer: a backgrounded tab resumes at the right place
     instead of finishing a burst of queued ticks. */
  React.useEffect(() => {
    if (!playing || phase !== "answering") return;
    const total = TIMELINE[step].ms;
    const started = performance.now();
    const id = window.setInterval(() => {
      setProgress({ step, value: Math.min(1, (performance.now() - started) / total) });
    }, 40);
    return () => window.clearInterval(id);
  }, [step, phase, playing]);

  /* Follow the transcript down as it grows, exactly as chat.tsx does. */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [phase, ratio]);

  function replay() {
    setProgress({ step: 0, value: 0 });
    setDecision(null);
    setStep(0);
  }

  /* A click on the gate resolves it immediately, whichever way it goes —
     the turn continues from either answer, as it does in the template. */
  function decide(approved: boolean) {
    setDecision(approved ? "approved" : "denied");
    setStep(TIMELINE.findIndex((t) => t.phase === "resolved"));
  }

  const showTurn = phase !== "empty";
  /* The card, once proposed, stays on screen for the rest of the turn — in
     the template the tool part is part of the message, not a modal that
     vanishes. */
  const showCard = phase === "proposed" || phase === "resolved" || phase === "secondAsk" || phase === "answering" || phase === "done";
  const cardSettled = phase !== "proposed";
  const approved = resolvedDecision === "approved";

  const showSecondTurn = phase === "secondAsk" || phase === "answering" || phase === "done";
  const answer = approved ? ANSWER_REMEMBERED : ANSWER_GENERIC;
  const answerText =
    phase === "answering" ? sliceTo(answer, ratio) : phase === "done" ? answer : "";

  /* The toast is the receipt: it appears the moment the save lands and is
     gone by the next question — a notification, not a permanent fixture. */
  const showToast = cardSettled && approved && phase === "resolved";

  const memories = cardSettled && approved ? [{ id: "m1", text: FACT, updatedAt: "just now" }] : [];

  return (
    <div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border border-(--border)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Window chrome. The pill earns its space: the gate is a status the
            model cannot move past, and naming it is half the demo. */}
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
              style={{
                background:
                  status === "waiting on you" ? "#f59e0b" : busy ? "var(--primary)" : "#22c55e",
              }}
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
            the site's. Chat on the left, memory panel docked on the right —
            the template's layout, minus the mobile drawer. */}
        <div className="flex h-[26rem] bg-white text-zinc-900 sm:h-[30rem] dark:bg-zinc-950 dark:text-zinc-100">
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1">
              <div ref={scrollRef} className="h-full overflow-y-auto">
                <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">
                  {!showTurn && (
                    <div className="pt-16 text-center">
                      <h3 className="text-lg font-semibold tracking-tight">What can I help with?</h3>
                      <p className="mt-1.5 text-xs text-zinc-500">
                        Tell me something about yourself and watch what happens before anything is
                        remembered.
                      </p>
                    </div>
                  )}

                  {showTurn && (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-3.5 py-2 text-[13px] leading-6 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                          {QUESTION_1}
                        </div>
                      </div>

                      {phase === "asked" && <ThinkingIndicator />}

                      {/* The proposal, in the conversation rather than over
                          it. Pending and settled must not look alike — the
                          component keeps them apart by itself. */}
                      {showCard && (
                        <ApprovalRequest
                          title={cardSettled && !approved ? "Memory suggestion declined" : "Remember this?"}
                          requester="The assistant"
                          description={
                            cardSettled
                              ? undefined
                              : "Nothing is stored unless you approve. This fact would be included in future replies."
                          }
                          detail={cardSettled ? undefined : PROPOSAL_DETAIL}
                          status={cardSettled ? (approved ? "approved" : "denied") : "pending"}
                          onAllow={cardSettled ? undefined : () => decide(true)}
                          onDeny={cardSettled ? undefined : () => decide(false)}
                        />
                      )}

                      {showSecondTurn && (
                        <>
                          <div className="flex justify-end">
                            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-3.5 py-2 text-[13px] leading-6 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                              {QUESTION_2}
                            </div>
                          </div>

                          {phase === "secondAsk" && <ThinkingIndicator />}

                          {answerText && (
                            <div className="space-y-2">
                              {/* The chip is the tell: the answer below is not
                                  generic, and the app says why rather than
                                  letting the user wonder. */}
                              {approved && <MemoryChip variant="on" label="Memory on · 1 saved" />}
                              <p className="whitespace-pre-wrap text-[13px] leading-6 text-zinc-800 dark:text-zinc-200">
                                {answerText}
                                {phase === "answering" && (
                                  <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
                                )}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* The receipt, over the transcript rather than in it — the
                  user was mid-conversation, so it must not take the layout
                  hostage. */}
              {showToast && (
                <div className="absolute inset-x-3 bottom-3 sm:left-auto sm:w-96">
                  <MemoryToast fact={FACT} kind="saved" onUndo={replay} onManage={() => {}} />
                </div>
              )}
            </div>

            <div className="border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
              <div className="mx-auto flex max-w-2xl items-center gap-2">
                <div className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-[13px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
                  {busy ? "Generating…" : "Ask anything…"}
                </div>
                <button
                  type="button"
                  onClick={replay}
                  className="inline-flex h-9 shrink-0 items-center rounded-xl bg-zinc-900 px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-80 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Send
                </button>
              </div>
              <p className="mx-auto mt-1.5 max-w-2xl text-center text-[10px] text-zinc-400">
                Nothing is remembered unless you approve it. Check the memory panel.
              </p>
            </div>
          </main>

          {/* The panel: docked on sm and up, the first thing to go below
              that — in the template it becomes a drawer, which a marketing
              frame does not need to pretend to have. */}
          <aside className="hidden w-72 shrink-0 flex-col border-l border-zinc-200 p-3 sm:flex dark:border-zinc-800">
            <MemoryList
              items={memories}
              title="Memory"
              description="Facts you approved, injected into every request."
              emptyText="Nothing saved yet. Approve a suggestion in the conversation and it lands here."
            />
            <p className="mt-auto px-1 pt-3 text-[10px] leading-4 text-zinc-400">
              Edit or delete here and the next message sees the change.
            </p>
          </aside>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
          A scripted replay of two turns — the approval card is real and clickable, but it also
          resolves on its own so the loop continues; there is no model and no route behind this
          page. In the template, the write happens only on your click.
        </p>
      )}
    </div>
  );
}
