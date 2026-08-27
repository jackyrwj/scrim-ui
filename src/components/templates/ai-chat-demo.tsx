"use client";

import * as React from "react";
import { PromptInput } from "@/showcase/prompt-input/prompt-input";
import { ThinkingIndicator } from "@/showcase/thinking-indicator/thinking-indicator";
import { Reasoning } from "@/showcase/reasoning/reasoning";
import { ToolCall } from "@/showcase/tool-call/tool-call";
import { MessageActions } from "@/showcase/message-actions/message-actions";
import { sliceTo, useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The AI Chat template, playing one turn.
 *
 * A template page that shows only a file list asks for $49 against a
 * description. This is the answer to "what does it actually look like?" —
 * and it is not a screenshot, because it does not have to be: the six
 * components the template ships (`components/ui/*.tsx`) are byte-identical
 * to the ones under src/showcase, so the marketing page can mount the real
 * ones. What renders below is the same code the buyer downloads, in the same
 * layout components/chat.tsx puts it in.
 *
 * What it is NOT is a live model. There is no key on this page and no route
 * behind it — the turn is scripted, which is stated under the frame rather
 * than left for someone to discover. The alternative, a real chat endpoint on
 * a marketing page, is a gateway bill anyone can run up from a browser.
 *
 * The one thing worth reading twice is why the phases exist at all. The
 * template's selling point is that `status` has four values and each one is a
 * different screen; a demo that jumped from question to finished answer would
 * skip the three states that are the actual work. So the timeline walks them:
 * submitted (thinking indicator, composer showing Stop), streaming (reasoning,
 * then a tool call, then text under a caret), ready (actions appear, composer
 * returns). The status pill in the window chrome names the state as it goes.
 */

/* Mirrors templates/ai-chat/lib/models.ts. A copy, deliberately: the template
   is a standalone app with its own tsconfig, and reaching into it from the
   site would couple the two builds to save four lines. */
const MODELS = [
  { id: "anthropic/claude-sonnet-5", name: "Claude Sonnet 5", hint: "Balanced — the default" },
  { id: "anthropic/claude-opus-5", name: "Claude Opus 5", hint: "Deepest reasoning" },
  { id: "openai/gpt-5.5", name: "GPT-5.5", hint: "Fast and broad" },
  { id: "google/gemini-3.5-flash", name: "Gemini 3.5 Flash", hint: "Cheapest, long context" },
];

const QUESTION = "What's the weather in Shenzhen — do I need a coat?";

const REASONING =
  "Two questions, not one. The temperature needs the weather tool; the coat is a judgement I make from what comes back, so call the tool first and answer both together.";

const TOOL_INPUT = `{
  "city": "Shenzhen",
  "unit": "celsius"
}`;

const TOOL_OUTPUT = `{
  "city": "Shenzhen",
  "temperature": 19,
  "unit": "celsius",
  "conditions": "light rain"
}`;

const ANSWER =
  "It's 19°C in Shenzhen with light rain. That's mild enough that a coat would be too much — but take something with a hood, because the rain is the part you'll notice.";

/* The turn, as a sequence of screens. Durations are the pacing of the replay,
   not of a real model: long enough to read what changed, short enough that
   the loop comes back around while someone is still on the page. */
type Phase = "empty" | "submitted" | "reasoning" | "tool" | "toolDone" | "answering" | "done";

const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "empty", ms: 900 },
  { phase: "submitted", ms: 1200 },
  { phase: "reasoning", ms: 2600 },
  { phase: "tool", ms: 1600 },
  { phase: "toolDone", ms: 900 },
  { phase: "answering", ms: 3400 },
  { phase: "done", ms: 5200 },
];

/** What `status` from useChat would be on each screen — the pill, and the
 *  composer's Stop button, both read from here rather than guessing. */
function statusFor(phase: Phase): "ready" | "submitted" | "streaming" {
  if (phase === "empty" || phase === "done") return "ready";
  if (phase === "submitted") return "submitted";
  return "streaming";
}

const CONVERSATIONS = [
  "Weather in Shenzhen",
  "Refactor the auth guard",
  "Explain the parts array",
  "Draft the release notes",
];

export function AiChatDemo() {
  const [step, setStep] = React.useState(0);
  /* Tagged with the step it belongs to, so moving on resets the reveal
     without an effect having to zero it. */
  const [progress, setProgress] = React.useState({ step: 0, value: 0 });

  const frameRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  /* Reduced motion gets the finished turn and nothing moving: the point of
     the frame is what the app looks like, and that survives being still. */
  const phase = reduced ? "done" : TIMELINE[step].phase;
  const ratio = progress.step === step ? progress.value : 0;
  const status = statusFor(phase);
  const busy = status !== "ready";

  const playing = inView && !reduced;

  /* The step machine. One timeout per screen, cleared on every change, so
     scrolling away mid-turn cannot leave a stray timer behind. */
  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % TIMELINE.length), TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  /* The reveal for whichever text this screen is streaming. Driven off elapsed
     time rather than a per-character timer: a tab that was backgrounded
     resumes at the right place instead of finishing a burst of queued ticks. */
  React.useEffect(() => {
    if (!playing || (phase !== "reasoning" && phase !== "answering")) return;
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
    setStep(0);
  }

  const showTurn = phase !== "empty";
  const reasoningText = phase === "reasoning" ? sliceTo(REASONING, ratio) : REASONING;
  const answerText =
    phase === "answering" ? sliceTo(ANSWER, ratio) : phase === "done" ? ANSWER : "";

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
          {/* First thing to go when the bar gets tight: it is set dressing,
              and the status pill beside it is not. */}
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
        <div className="flex h-[26rem] bg-white text-zinc-900 sm:h-[30rem] dark:bg-zinc-950 dark:text-zinc-100">
          <aside className="hidden w-52 shrink-0 flex-col border-r border-zinc-200 p-2.5 sm:flex dark:border-zinc-800">
            <div className="mb-2.5 flex h-8 items-center justify-center rounded-lg border border-zinc-200 text-xs font-medium dark:border-zinc-800">
              New chat
            </div>
            <div className="space-y-0.5">
              {CONVERSATIONS.map((title, i) => (
                <div
                  key={title}
                  className={`truncate rounded-md px-2 py-1.5 text-[12px] ${
                    i === 0
                      ? "bg-zinc-100 font-medium dark:bg-zinc-900"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {title}
                </div>
              ))}
            </div>
            <p className="mt-auto px-2 text-[10px] leading-4 text-zinc-400">
              Saved locally. Swapping in your database touches one file.
            </p>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col">
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">
                {!showTurn && (
                  <div className="pt-20 text-center">
                    <h3 className="text-lg font-semibold tracking-tight">What can I help with?</h3>
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Ask anything, or try the weather to see a tool call.
                    </p>
                  </div>
                )}

                {showTurn && (
                  <>
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-3.5 py-2 text-[13px] leading-6 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                        {QUESTION}
                      </div>
                    </div>

                    {phase === "submitted" && <ThinkingIndicator />}

                    {/* Parts, in the order the model produced them — reasoning,
                        then the tool, then the text. The template's whole
                        first feature bullet is this ordering. */}
                    {phase !== "submitted" && (
                      <div className="group space-y-3">
                        <Reasoning
                          steps={[{ title: "Thinking", detail: reasoningText }]}
                          isThinking={phase === "reasoning"}
                          defaultOpen
                        />

                        {phase !== "reasoning" && (
                          <ToolCall
                            name="getWeather"
                            status={phase === "tool" ? "running" : "success"}
                            input={TOOL_INPUT}
                            output={phase === "tool" ? undefined : TOOL_OUTPUT}
                            duration={phase === "tool" ? undefined : "0.4s"}
                            defaultOpen
                          />
                        )}

                        {answerText && (
                          <p className="whitespace-pre-wrap text-[13px] leading-6 text-zinc-800 dark:text-zinc-200">
                            {answerText}
                            {phase === "answering" && (
                              <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
                            )}
                          </p>
                        )}

                        {/* Only once the turn has settled. Copying half a
                            streamed sentence is never what anyone wanted.
                            Shown outright rather than on hover as the
                            template does it — an affordance nobody knows to
                            hover for is one this page failed to show. */}
                        {phase === "done" && <MessageActions onCopy={() => {}} onRegenerate={replay} />}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
              <div className="mx-auto max-w-2xl">
                <PromptInput
                  models={MODELS}
                  defaultModel={MODELS[0].id}
                  placeholder={busy ? "Generating…" : "Ask anything…"}
                  loading={busy}
                  onSubmit={replay}
                  onStop={replay}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
        A scripted replay of one turn — the six components above are the real ones the template
        ships, mounted here, but there is no model behind this page. The template you download talks
        to yours.
      </p>
    </div>
  );
}
