"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ReasoningLevel = "light" | "balanced" | "deep";

export type ReasoningLevelProps = {
  value?: ReasoningLevel;
  onChange?: (level: ReasoningLevel) => void;
  compact?: boolean;
  className?: string;
};

const LEVELS: { id: ReasoningLevel; label: string; hint: string }[] = [
  { id: "light", label: "Light", hint: "Fast answers for simple questions" },
  { id: "balanced", label: "Balanced", hint: "A good default for most tasks" },
  { id: "deep", label: "Deep", hint: "Thinks longer for hard problems" },
];

/* ------------------------------------------------------------------ */
/* ReasoningLevel                                                      */
/* ------------------------------------------------------------------ */

export function ReasoningLevel({
  value = "balanced",
  onChange,
  compact = false,
  className = "",
}: ReasoningLevelProps) {
  const current = LEVELS.find((l) => l.id === value) ?? LEVELS[1];

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Reasoning effort</p>
        <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
          {current.label}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Reasoning effort"
        className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800"
      >
        {LEVELS.map((level) => {
          const active = level.id === current.id;
          return (
            <button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange?.(level.id)}
              className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : /* zinc-600, not zinc-500: an unselected label sits on the
                       zinc-100 track, where zinc-500 measures 4.40:1 and fails
                       AA. zinc-600 is 7.03:1. The white pill and its shadow —
                       not a washed-out label — are what mark the selection. */
                    "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {level.label}
            </button>
          );
        })}
      </div>

      {!compact && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{current.hint}</p>
      )}
    </div>
  );
}
