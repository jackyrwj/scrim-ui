"use client";

import * as React from "react";
import { GeneratedMediaResult } from "@/showcase/generated-media/generated-media";
import { ModerationFlag } from "@/showcase/moderation-flag/moderation-flag";
import { ErrorMessage } from "@/showcase/error-message/error-message";
import { useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The Image Studio template, playing three jobs — one that works, and the
 * two ways one can end badly.
 *
 * The template's headline feature is not that it generates images; it is
 * that a job is an async object with five statuses (queued → running →
 * succeeded / failed / blocked) and each one is a different card in the
 * gallery. A demo that showed prompt-in, image-out would skip the states
 * that are the actual work, so the timeline walks the whole lifecycle of
 * one job: the card appears queued with a queue position, runs with the
 * stage named in words (never a fake percentage), and settles with the
 * image in place.
 *
 * Then the second beat, which is the reason to buy the template at all:
 * `failed` and `blocked` are not the same outcome and must not look like
 * it. Failed is infrastructure — the worker stopped, nothing was charged,
 * and the card offers Retry. Blocked is policy — the classifier refused the
 * prompt before generation started, and the card explains how to rephrase
 * and offers no retry, because retrying the same prompt would just be
 * refused again. The two cards arrive side by side so the difference is
 * visible rather than documented.
 *
 * What this is NOT is a live backend. There is no key on this page and no
 * worker behind it — the jobs are scripted, the "generated" image is an
 * inline SVG, and the failure timings are chosen for reading pace. That is
 * stated under the frame rather than left for someone to discover. The
 * components are the real ones the template ships, mounted here.
 */

/* The three prompts. The failed one nods at the template's simulated
   backend, which fails any prompt containing "fail" so the retryable path
   is exercisable without a real worker. */
const MAIN_PROMPT = "A lighthouse on a cliff at dusk, waves below";
const FAIL_PROMPT = "An isometric render of a fail whale on a server rack";
const BLOCK_PROMPT = "A photo of a real private person, by name";

type Phase = "idle" | "queued" | "generating" | "ready" | "failedShown" | "done";

/* Durations are the pacing of the replay, not of a real worker: long enough
   to read what changed, short enough that the loop comes back around while
   someone is still on the page. */
const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "idle", ms: 900 },
  { phase: "queued", ms: 1400 },
  { phase: "generating", ms: 3200 },
  { phase: "ready", ms: 2400 },
  { phase: "failedShown", ms: 2600 },
  { phase: "done", ms: 6400 },
];

/** What the chrome pill says on each screen — it names the job's status,
 *  because the status machine is the thing being sold. */
function pillFor(phase: Phase): string {
  switch (phase) {
    case "idle":
      return "idle";
    case "queued":
      return "job: queued";
    case "generating":
      return "job: running";
    case "ready":
      return "job: succeeded";
    default:
      return "1 succeeded · 1 failed · 1 blocked";
  }
}

/** The generating stage, in words. Progress as a percentage would be a lie
 *  the component itself refuses to tell — see generated-media.tsx. */
function stageFor(ratio: number): string {
  if (ratio < 0.35) return "Warming up a worker";
  if (ratio < 0.78) return "Diffusing — 24 of 30 steps";
  return "Upsampling";
}

export function ImageStudioDemo({ caption = true }: { caption?: boolean }) {
  const [step, setStep] = React.useState(0);
  /* Tagged with the step it belongs to, so moving on resets the reveal
     without an effect having to zero it. */
  const [progress, setProgress] = React.useState({ step: 0, value: 0 });

  const frameRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  /* Reduced motion gets the settled gallery — all three outcomes visible,
     nothing moving. The states are the content; they survive being still. */
  const phase: Phase = reduced ? "done" : TIMELINE[step].phase;
  const ratio = progress.step === step ? progress.value : 0;
  const busy = phase === "queued" || phase === "generating";

  const playing = inView && !reduced;

  /* The step machine. One timeout per screen, cleared on every change, so
     scrolling away mid-job cannot leave a stray timer behind. */
  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % TIMELINE.length), TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  /* Drives the stage words while generating. Driven off elapsed time rather
     than a per-tick timer: a tab that was backgrounded resumes at the right
     stage instead of bursting through queued ticks. */
  React.useEffect(() => {
    if (!playing || phase !== "generating") return;
    const total = TIMELINE[step].ms;
    const started = performance.now();
    const id = window.setInterval(() => {
      setProgress({ step, value: Math.min(1, (performance.now() - started) / total) });
    }, 40);
    return () => window.clearInterval(id);
  }, [step, phase, playing]);

  /* Keep the newest card in view as the gallery grows, newest-first like
     the template's gallery.tsx. */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;
  }, [phase]);

  function replay() {
    setProgress({ step: 0, value: 0 });
    setStep(0);
  }

  const mainStatus =
    phase === "queued"
      ? "queued"
      : phase === "generating"
        ? "generating"
        : ("ready" as const);
  const showMain = phase !== "idle";
  const showFailed = phase === "failedShown" || phase === "done";
  const showBlocked = phase === "done";
  const doneCount = phase === "ready" || showFailed ? 1 : 0;

  return (
    <div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border border-(--border)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Window chrome. The pill names the job status driving whatever is
            on screen — the five-status machine is the template's claim. */}
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
            {pillFor(phase)}
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
            than the site's. The two-pane layout mirrors the template's
            image-studio.tsx: composer on the left, gallery on the right. */}
        <div className="flex h-[26rem] flex-col bg-zinc-50 text-zinc-900 sm:h-[30rem] dark:bg-zinc-950 dark:text-zinc-100">
          <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
            <div>
              <h3 className="text-[13px] font-semibold tracking-tight">Image Studio</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Async generation jobs — queue, poll, gallery
              </p>
            </div>
            <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-500 tabular-nums dark:border-zinc-800 dark:text-zinc-400">
              {doneCount} {doneCount === 1 ? "job" : "jobs"} done
            </span>
          </header>

          <div className="flex min-h-0 flex-1">
            {/* The composer, frozen mid-draft. It is set dressing — the
                replay drives the gallery — but the prompt in the box is the
                prompt on the card, because that link is the app's loop. */}
            <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-zinc-200 p-3.5 sm:block dark:border-zinc-800">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Prompt
                </span>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[13px] leading-6 dark:border-zinc-700 dark:bg-zinc-950">
                  {MAIN_PROMPT}
                </div>

                <span className="mt-4 mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Style
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["None", "Photographic", "Illustration", "Watercolor"].map((label, i) => (
                    <span
                      key={label}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        i === 1
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <span className="mt-4 mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Aspect ratio
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["1:1", "3:2", "2:3"].map((r, i) => (
                    <span
                      key={r}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium tabular-nums ${
                        i === 0
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>

                <div
                  className={`mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-center text-[13px] font-medium text-white transition-opacity dark:bg-zinc-100 dark:text-zinc-900 ${
                    busy ? "opacity-40" : ""
                  }`}
                >
                  {busy ? "Queuing…" : "Generate 1 image"}
                </div>

                <p className="mt-3 text-[10px] leading-4 text-zinc-400 dark:text-zinc-500">
                  With no API key the simulated backend renders placeholders — a prompt containing
                  “fail” fails retryably; one containing “nsfw” is blocked.
                </p>
              </div>
            </aside>

            {/* The gallery: one card per job, newest first. */}
            <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto p-3.5">
              <div className="space-y-3.5">
                {!showMain && (
                  <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-center dark:border-zinc-700">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Nothing generated yet
                    </p>
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      Write a prompt on the left and press Generate.
                    </p>
                  </div>
                )}

                {/* Second beat, newest first: blocked is policy — rephrase,
                    never retry. The flag is the input-stage ModerationFlag
                    the template ships; nothing was generated, so there is
                    nothing to preserve, only the way forward. */}
                {showBlocked && (
                  <JobCard
                    prompt={BLOCK_PROMPT}
                    meta="1:1 · 1 variant · simulated"
                    pill="blocked"
                    pillClass="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  >
                    <ModerationFlag
                      stage="input"
                      message="The classifier refused this prompt before generation started — prompts that name identifiable private individuals are not run. Edit the prompt and submit a new job; retrying this one changes nothing."
                      onAppeal={() => {}}
                    />
                  </JobCard>
                )}

                {/* Failed is infrastructure: the worker stopped, nothing was
                    charged, and Retry is the way forward. Same red surface
                    as the template's gallery, built from the shipped
                    ErrorMessage. */}
                {showFailed && (
                  <JobCard
                    prompt={FAIL_PROMPT}
                    meta="1:1 · 1 variant · simulated"
                    pill="failed"
                    pillClass="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  >
                    <ErrorMessage
                      message="The worker stopped mid-generation — out of memory while upsampling. Nothing was charged; retry starts the same settings over."
                      onRetry={replay}
                    />
                  </JobCard>
                )}

                {/* The main job, walking queued → generating → ready. The
                    card is the shipped GeneratedMediaResult, including its
                    two honesty rules: a queue position instead of a fake
                    percentage, and the stage in words. */}
                {showMain && (
                  <GeneratedMediaResult
                    kind="image"
                    status={mainStatus}
                    prompt={MAIN_PROMPT}
                    params={["1024×1024", "photographic", "seed 42"]}
                    queuePosition={phase === "queued" ? 2 : undefined}
                    stage={phase === "generating" ? stageFor(ratio) : undefined}
                    onRegenerate={mainStatus === "ready" ? replay : undefined}
                    onDownload={mainStatus === "ready" ? () => {} : undefined}
                  >
                    {mainStatus === "ready" && <GeneratedImage />}
                  </GeneratedMediaResult>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
          A scripted replay of three jobs — one queued, generated and settled, one that{" "}
          <strong className="font-medium text-(--foreground)">failed</strong> (retryable; nothing
          was charged) and one <strong className="font-medium text-(--foreground)">blocked</strong>{" "}
          by policy (not retryable — rephrase). The result card and both notices are the real
          components the template ships, but there is no model or worker behind this page; the
          “generated” image is an inline placeholder.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The gallery card shell for the two failure outcomes                  */
/* ------------------------------------------------------------------ */

/* The template's gallery renders its own cards around the shipped notice
   components; this is that shell, minus delete buttons a replay has no
   use for. */
function JobCard({
  prompt,
  meta,
  pill,
  pillClass,
  children,
}: {
  prompt: string;
  meta: string;
  pill: string;
  pillClass: string;
  children: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium" title={prompt}>
            {prompt}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">{meta}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${pillClass}`}>
          {pill}
        </span>
      </header>
      <div className="mx-4 mb-4">{children}</div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* The "generated" image                                                */
/* ------------------------------------------------------------------ */

/* A hand-rolled inline SVG standing in for the worker's output. No
   external asset and no network: a marketing page that hot-linked a real
   render would be making claims with someone else's bytes. */
function GeneratedImage() {
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label="Generated placeholder: a lighthouse on a cliff at dusk, waves below"
      className="block h-full w-full"
    >
      <defs>
        <linearGradient id="demo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#312e81" />
          <stop offset="0.55" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="demo-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fef9c3" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#demo-sky)" />
      <circle cx="316" cy="196" r="26" fill="#fde68a" opacity="0.9" />
      {/* The light beam, sweeping left from the lamp. */}
      <polygon points="150,68 20,40 20,96" fill="url(#demo-beam)" />
      {/* Cliff and sea. */}
      <polygon points="120,300 170,150 260,170 400,150 400,300" fill="#1e1b4b" />
      <rect y="240" width="400" height="60" fill="#0f172a" opacity="0.85" />
      <path d="M0 244 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#a5b4fc" strokeWidth="2" opacity="0.7" />
      <path d="M0 262 q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.5" />
      {/* The lighthouse itself. */}
      <polygon points="150,70 162,70 168,168 144,168" fill="#f8fafc" />
      <rect x="144" y="118" width="24" height="10" fill="#dc2626" />
      <rect x="146" y="88" width="20" height="8" fill="#dc2626" />
      <rect x="146" y="56" width="20" height="14" rx="2" fill="#0f172a" />
      <circle cx="156" cy="63" r="4" fill="#fef9c3" />
      <polygon points="146,56 166,56 156,44" fill="#dc2626" />
    </svg>
  );
}
