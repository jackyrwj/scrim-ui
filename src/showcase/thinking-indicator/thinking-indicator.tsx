"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ThinkingIndicatorProps = {
  /** Visual style — bouncing dots, a blinking caret, or a labeled pulse. */
  variant?: "dots" | "caret" | "label";
  /** Short status line shown alongside the animation (default "Thinking"). */
  label?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Animations — one shared keyframes block                             */
/* ------------------------------------------------------------------ */

const KEYFRAMES = `
@keyframes aiui-think-bounce{0%,80%,100%{opacity:.25;transform:scale(.85)}40%{opacity:1;transform:scale(1)}}
@keyframes aiui-think-caret{50%{opacity:0}}
/* .85, not .4: this one pulses real text, and at .4 the label rendered
   1.68:1 against the bubble — unreadable for part of every cycle. The dots
   above may fade further because they are decorative and aria-hidden. */
@keyframes aiui-think-pulse{0%,100%{opacity:.85}50%{opacity:1}}
@media(prefers-reduced-motion:reduce){.scrim-thinking *{animation:none!important}}
`;

function Dots() {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current"
          style={{ animation: `aiui-think-bounce 1.2s ${i * 0.15}s infinite ease-in-out` }}
        />
      ))}
    </span>
  );
}

function Caret() {
  return (
    <span
      aria-hidden
      className="inline-block h-[1em] w-[2px] translate-y-[2px] rounded-full bg-current"
      style={{ animation: "aiui-think-caret 1s steps(1) infinite" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* ThinkingIndicator                                                   */
/* ------------------------------------------------------------------ */

export function ThinkingIndicator({
  variant = "dots",
  label = "Thinking",
  className = "",
}: ThinkingIndicatorProps) {
  return (
    <div
      className={`scrim-thinking inline-flex items-center gap-2 text-sm text-muted-foreground ${className}`}
    >
      <style>{KEYFRAMES}</style>
      <span className="flex min-h-8 items-center gap-2">
        {variant === "dots" && <Dots />}
        {variant === "caret" && <Caret />}
        {variant === "label" && (
          <span

            className="inline-block text-muted-foreground"
            style={{ animation: "aiui-think-pulse 1.4s infinite ease-in-out" }}
          >
            {label}…
          </span>
        )}
        {variant !== "label" && <span>{label}…</span>}
      </span>
    </div>
  );
}
