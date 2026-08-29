"use client";

import * as React from "react";
import { PromptInput } from "../../prompt-input/prompt-input";
import { ModelSelector } from "../../model-selector/model-selector";
import { GeneratedMediaResult, type MediaStatus } from "../../generated-media/generated-media";

/** CSS-painted stand-in for a generated image — patterns ship no assets. */
function ImageMock({ hue = 210 }: { hue?: number }) {
  return (
    <div
      role="img"
      aria-label="Generated illustration: a mountain ridge at dusk"
      className="flex h-full min-h-[220px] w-full items-end p-4"
      style={{
        background: `linear-gradient(180deg, hsl(${hue} 60% 75%) 0%, hsl(${hue} 55% 45%) 60%, hsl(${hue} 50% 25%) 100%)`,
      }}
    >
      <svg viewBox="0 0 400 80" className="w-full" aria-hidden="true">
        <path d="M0 80 L90 20 L160 60 L240 10 L320 55 L400 30 L400 80 Z" fill="hsl(0 0% 100% / 0.25)" />
        <path d="M0 80 L120 45 L220 70 L340 40 L400 60 L400 80 Z" fill="hsl(0 0% 0% / 0.2)" />
      </svg>
    </div>
  );
}

/**
 * A one-screen image generation studio.
 *
 * The flow this pattern exists to show:
 *
 * 1. **The queue is visible.** A submitted prompt enters the feed as a
 *    queued card immediately — position stated, no spinner-and-nothing.
 * 2. **Generation is staged, then it settles.** Queued → generating (stage
 *    in words) → ready; the card never changes shape underneath the reader.
 * 3. **Results come back as variants.** One prompt, three takes — picking
 *    one is cheap and reversible.
 * 4. **Blocked and failed are different days.** The second generation in
 *    this script hits the content policy (rephrase, no retry); the third
 *    fails on the worker (retry, which then succeeds).
 * 5. **The prompt is the re-use path.** Clicking a result's prompt loads it
 *    back into the composer.
 */

type Result = {
  id: number;
  kind: "image";
  status: MediaStatus;
  prompt: string;
  params: string[];
  stage?: string;
  queuePosition?: number;
  variants: { id: string }[];
  currentVariantId: string;
  hue: number;
  errorMessage?: string;
  blockedReason?: string;
};

const STAGES = ["Reading the prompt…", "Composing the scene…", "Diffusing latents…", "Upsampling…"];

const MODELS = [
  { id: "fable-image", name: "Fable Image 2", hint: "Quality" },
  { id: "sketch", name: "Sketch Turbo", hint: "Fast drafts" },
];

const INITIAL_RESULTS: Result[] = [
  {
    id: 1,
    kind: "image",
    status: "ready",
    prompt: "A mountain ridge at dusk, soft gradient sky, minimal illustration",
    params: ["1024×1024", "seed 4815", "illustration"],
    variants: [{ id: "v1" }, { id: "v2" }, { id: "v3" }],
    currentVariantId: "v1",
    hue: 210,
  },
];

export function ImageStudioPattern() {
  const [results, setResults] = React.useState<Result[]>(INITIAL_RESULTS);
  const [model, setModel] = React.useState("fable-image");
  const [draftPrompt, setDraftPrompt] = React.useState("");
  const idRef = React.useRef(2);
  const timers = React.useRef<number[]>([]);

  function patch(id: number, p: Partial<Result>) {
    setResults((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  function schedule(id: number, fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  /** The scripted outcomes: 1st new generation succeeds, 2nd is policy-
      blocked, 3rd fails (its Retry succeeds), 4th+ succeed again. */
  function runGeneration(prompt: string) {
    const id = idRef.current++;
    const attempt = results.length; // initial card counts as a past success
    const outcome = attempt % 3 === 1 ? "blocked" : attempt % 3 === 2 ? "failed" : "ready";
    const hue = [160, 330, 45, 260][id % 4];

    const base: Result = {
      id,
      kind: "image",
      status: "queued",
      prompt,
      params: ["1024×1024", `seed ${1000 + id * 37}`, model === "sketch" ? "draft" : "illustration"],
      queuePosition: 2,
      variants: [{ id: "v1" }, { id: "v2" }, { id: "v3" }],
      currentVariantId: "v1",
      hue,
    };
    setResults((rs) => [base, ...rs]);

    schedule(id, () => patch(id, { status: "generating", stage: STAGES[0], queuePosition: undefined }), 1200);
    STAGES.forEach((s, i) => schedule(id, () => patch(id, { stage: s }), 1200 + 700 * i));
    const settleAt = 1200 + 700 * STAGES.length;
    if (outcome === "ready") {
      schedule(id, () => patch(id, { status: "ready", stage: undefined }), settleAt);
    } else if (outcome === "blocked") {
      schedule(
        id,
        () =>
          patch(id, {
            status: "blocked",
            stage: undefined,
            blockedReason: "The prompt names a real public figure. Describe a fictional character or scene instead.",
          }),
        settleAt,
      );
    } else {
      schedule(
        id,
        () => patch(id, { status: "failed", stage: undefined, errorMessage: "The worker ran out of memory mid-generation." }),
        settleAt,
      );
    }
  }

  function retry(r: Result) {
    patch(r.id, { status: "generating", stage: STAGES[1], errorMessage: undefined });
    schedule(r.id, () => patch(r.id, { status: "ready", stage: undefined }), 1600);
  }

  function regenerate(r: Result) {
    const order = ["v1", "v2", "v3"];
    const next = order[(order.indexOf(r.currentVariantId) + 1) % order.length];
    patch(r.id, { status: "generating", stage: STAGES[2], currentVariantId: next });
    schedule(r.id, () => patch(r.id, { status: "ready", stage: undefined }), 1400);
  }

  return (
    <div className="flex h-[640px] overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Composer rail */}
      <aside className="hidden w-72 shrink-0 flex-col gap-3 border-r border-zinc-200 p-3 dark:border-zinc-800 md:flex">
        <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Image Studio</p>
        <ModelSelector options={MODELS} value={model} onSelect={setModel} />
        {draftPrompt && (
          <p className="rounded-lg bg-zinc-50 px-2.5 py-2 text-[11px] leading-4 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
            Reusing: “{draftPrompt}”
          </p>
        )}
        <div className="mt-auto">
          <PromptInput
            placeholder="Describe the image…"
            onSubmit={(v) => {
              runGeneration(v);
              setDraftPrompt("");
            }}
          />
        </div>
      </aside>

      {/* Results feed */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 md:hidden">
          <PromptInput
            placeholder="Describe the image…"
            onSubmit={(v) => runGeneration(v)}
          />
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {results.map((r) => (
            <GeneratedMediaResult
              key={r.id}
              kind={r.kind}
              status={r.status}
              prompt={r.prompt}
              params={r.params}
              stage={r.stage}
              queuePosition={r.queuePosition}
              variants={r.variants}
              currentVariantId={r.currentVariantId}
              onVariantChange={(vid) => patch(r.id, { currentVariantId: vid })}
              errorMessage={r.errorMessage}
              blockedReason={r.blockedReason}
              onDownload={() => {}}
              onRegenerate={() => regenerate(r)}
              onRetry={() => retry(r)}
              onCancel={() => patch(r.id, { status: "cancelled", stage: undefined })}
            >
              <ImageMock hue={r.hue + (r.currentVariantId === "v2" ? 30 : r.currentVariantId === "v3" ? -30 : 0)} />
            </GeneratedMediaResult>
          ))}
        </div>
      </div>
    </div>
  );
}
