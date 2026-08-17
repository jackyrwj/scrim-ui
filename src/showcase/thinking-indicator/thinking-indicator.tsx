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
@keyframes aiui-think-pulse{0%,100%{opacity:.4}50%{opacity:1}}
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
      className={`inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 ${className}`}
    >
      <style>{KEYFRAMES}</style>
      <span className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
        AI
      </span>
      <span className="flex min-h-8 items-center gap-2 rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50 px-3.5 py-2 dark:border-zinc-800 dark:bg-zinc-800/60">
        {variant === "dots" && <Dots />}
        {variant === "caret" && <Caret />}
        {variant === "label" && (
          <span
            className="inline-block"
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
