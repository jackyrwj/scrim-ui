"use client";

import * as React from "react";
import { FRAME_COMPONENTS } from "../screenshot-mockup/device-frames";
import { useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The Screenshot Device Mockup, cycling a screenshot through the tool's
 * real device frames: iPhone, MacBook, iPad, browser. The frames are the
 * exact components the exporter wraps around an upload; the "screenshot"
 * inside is drawn in divs so the card carries no image asset.
 */

const STEP_MS = 2200;

const STEPS = [
  { key: "iphone15pro", label: "iPhone 15 Pro", w: 172, h: 258 },
  { key: "macbook", label: "MacBook", w: 296, h: 186 },
  { key: "ipad", label: "iPad", w: 246, h: 164 },
  { key: "browser", label: "Browser", w: 296, h: 196 },
] as const;

/* A small AI-chat screen standing in for the uploaded screenshot. */
function FakeScreenshot({ w, h }: { w: number; h: number }) {
  return (
    <div className="flex flex-col gap-2.5 bg-white p-3" style={{ width: w, height: h }}>
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <div className="h-4 w-4 rounded-md bg-violet-500" />
        <div className="h-2 w-20 rounded-full bg-zinc-200" />
        <div className="ml-auto h-2 w-8 rounded-full bg-zinc-100" />
      </div>
      <div className="max-w-[75%] self-end rounded-2xl rounded-tr-sm bg-violet-500 px-3 py-2">
        <div className="h-1.5 w-24 rounded-full bg-white/90" />
        <div className="mt-1 h-1.5 w-16 rounded-full bg-white/70" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2">
        <div className="h-1.5 w-28 rounded-full bg-zinc-300" />
        <div className="mt-1 h-1.5 w-20 rounded-full bg-zinc-300" />
        <div className="mt-1 h-1.5 w-24 rounded-full bg-zinc-200" />
      </div>
      <div className="mt-auto flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-2">
        <div className="h-1.5 w-24 rounded-full bg-zinc-100" />
        <div className="ml-auto h-4 w-4 rounded-full bg-violet-500" />
      </div>
    </div>
  );
}

export function ScreenshotMockupDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  const [step, setStep] = React.useState(1);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  const active = reduced ? STEPS[1] : STEPS[step];

  return (
    <div ref={frameRef} className="flex h-full flex-col items-center justify-center gap-3">
      <div className="relative flex h-[286px] w-full items-center justify-center">
        {STEPS.map((s) => {
          const Frame = FRAME_COMPONENTS[s.key];
          return (
            <div
              key={s.key}
              className="absolute transition-opacity duration-500"
              style={{ opacity: s === active ? 1 : 0 }}
            >
              <Frame>
                <FakeScreenshot w={s.w} h={s.h} />
              </Frame>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-(--muted-foreground)">{active.label}</span>
        <span className="flex gap-1">
          {STEPS.map((s) => (
            <span
              key={s.key}
              className="h-1 w-1 rounded-full transition-colors"
              style={{ background: s === active ? "var(--primary)" : "var(--border)" }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
