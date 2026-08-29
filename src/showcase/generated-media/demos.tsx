"use client";

import * as React from "react";
import { GeneratedMediaResult, type MediaStatus } from "./generated-media";

/** CSS-painted stand-ins for real media — the component never ships assets. */
export function ImageMock({ hue = 210 }: { hue?: number }) {
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

export function AudioMock() {
  return (
    <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 p-6" role="img" aria-label="Generated audio clip, 12 seconds">
      <div className="flex h-16 items-center gap-1">
        {[3, 7, 12, 8, 14, 10, 5, 9, 13, 6, 11, 4].map((h, i) => (
          <span key={i} style={{ height: `${h * 4}px` }} className="w-1.5 rounded-full bg-teal-500/80 dark:bg-teal-400/80" />
        ))}
      </div>
      <p className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">0:12 · lo-fi piano loop</p>
    </div>
  );
}

export function VideoMock() {
  return (
    <div
      className="relative flex h-full min-h-[220px] w-full items-center justify-center"
      role="img"
      aria-label="Generated video: waves rolling onto a beach, 4 seconds"
      style={{ background: "linear-gradient(180deg, hsl(200 60% 60%) 0%, hsl(190 55% 40%) 55%, hsl(45 40% 75%) 100%)" }}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-zinc-800 shadow">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="absolute bottom-2 right-3 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">0:04</span>
    </div>
  );
}

const STAGES = ["Reading the prompt…", "Composing the scene…", "Diffusing latents…", "Upsampling…"];

/** Queued → generating (staged) → ready, with variant cycling on regenerate. */
export function InteractiveMedia() {
  const [status, setStatus] = React.useState<MediaStatus>("ready");
  const [stageIndex, setStageIndex] = React.useState(0);
  const [variantId, setVariantId] = React.useState("v1");
  const timers = React.useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function generate() {
    clearTimers();
    setStatus("queued");
    timers.current.push(window.setTimeout(() => {
      setStatus("generating");
      setStageIndex(0);
      STAGES.forEach((_, i) => {
        timers.current.push(window.setTimeout(() => setStageIndex(i), 600 * i));
      });
      timers.current.push(window.setTimeout(() => setStatus("ready"), 600 * STAGES.length));
    }, 1200));
  }

  function regenerate() {
    setVariantId((v) => (v === "v1" ? "v2" : v === "v2" ? "v3" : "v1"));
    generate();
  }

  return (
    <div className="p-4">
      <GeneratedMediaResult
        kind="image"
        status={status}
        prompt="A mountain ridge at dusk, soft gradient sky, minimal illustration"
        params={["1024×1024", "seed 4815", "illustration"]}
        stage={STAGES[stageIndex]}
        queuePosition={2}
        variants={[{ id: "v1" }, { id: "v2" }, { id: "v3" }]}
        currentVariantId={variantId}
        onVariantChange={setVariantId}
        onDownload={() => {}}
        onRegenerate={regenerate}
        onCancel={() => {
          clearTimers();
          setStatus("cancelled");
        }}
        caption="Three variants from one prompt — pick one, or regenerate for a fresh set."
      >
        <ImageMock hue={variantId === "v1" ? 210 : variantId === "v2" ? 280 : 20} />
      </GeneratedMediaResult>
    </div>
  );
}

export function DemoDefault() {
  return <InteractiveMedia />;
}
