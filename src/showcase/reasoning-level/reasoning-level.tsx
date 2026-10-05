"use client";

import { Button } from "@/components/ui/button";
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
        <p className="text-sm font-medium text-foreground">Reasoning effort</p>
        <span className="text-xs font-medium text-muted-foreground">
          {current.label}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Reasoning effort"
        className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
      >
        {LEVELS.map((level) => {
          const active = level.id === current.id;
          return (
            <Button variant="ghost" size="sm"
              key={level.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange?.(level.id)}
              className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-card text-foreground shadow-sm"
                  :
                    "text-muted-foreground hover:text-foreground"
              }`}
            >
              {level.label}
            </Button>
          );
        })}
      </div>

      {!compact && (
        <p className="mt-2 text-xs text-muted-foreground">{current.hint}</p>
      )}
    </div>
  );
}
