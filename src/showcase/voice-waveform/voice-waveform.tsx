"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type WaveformState = "idle" | "listening" | "recording" | "speaking";

export type VoiceWaveformProps = {
  state?: WaveformState;
  bars?: number;
  className?: string;
};

/* Bars animate with the same keyframe; the state picks the speed,
   opacity and color (color comes from the parent via currentColor). */

const DURATION: Record<WaveformState, number> = {
  idle: 0,
  listening: 1.1,
  recording: 0.8,
  speaking: 0.55,
};

const OPACITY: Record<WaveformState, number> = {
  idle: 0.3,
  listening: 0.7,
  recording: 1,
  speaking: 1,
};

/* ------------------------------------------------------------------ */
/* VoiceWaveform                                                       */
/* ------------------------------------------------------------------ */

export function VoiceWaveform({
  state = "idle",
  bars = 24,
  className = "",
}: VoiceWaveformProps) {
  const dur = DURATION[state];
  const opacity = OPACITY[state];

  return (
    <>
      <style>{`@keyframes aiui-wave{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`}</style>
      <div className={`flex h-8 items-center gap-[2px] ${className}`} aria-hidden>
        {Array.from({ length: bars }).map((_, i) => {
          /* static bell shape: center bars taller than the edges */
          const t = i / Math.max(bars - 1, 1);
          /* Rounded, not raw: a full-precision float lands in the SSR HTML as
             scaleY(0.6943240406445356), and the browser hands it back to
             hydration as scaleY(0.694324) — a mismatch React reports as an
             error. Three decimals is well below a visible difference. */
          const base = Number((0.3 + 0.7 * Math.sin(Math.PI * t)).toFixed(3));
          return (
            <span
              key={i}
              className="w-[3px] rounded-full bg-current"
              style={{
                height: "100%",
                transform: `scaleY(${base})`,
                transformOrigin: "center",
                animation: dur
                  ? `aiui-wave ${dur}s ease-in-out ${i * (dur / bars)}s infinite`
                  : "none",
                opacity,
              }}
            />
          );
        })}
      </div>
    </>
  );
}
