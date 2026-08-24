"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ToolSetting = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export type ToolToggleProps = {
  tools: ToolSetting[];
  title?: string;
  description?: string;
  onToggle?: (id: string, enabled: boolean) => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* ToolToggle                                                          */
/* ------------------------------------------------------------------ */

export function ToolToggle({
  tools,
  title = "Tools",
  description = "What the assistant is allowed to use",
  onToggle,
  className = "",
}: ToolToggleProps) {
  /* Prefix for the per-row label/description ids the switches point at. */
  const uid = React.useId();

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {tools.map((tool) => (
          <li key={tool.id} className="flex items-center gap-3 px-4 py-3">
            {tool.icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {tool.icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p
                id={`${uid}-${tool.id}-name`}
                className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200"
              >
                {tool.name}
              </p>
              <p
                id={`${uid}-${tool.id}-desc`}
                className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400"
              >
                {tool.description}
              </p>
            </div>
            {/* The switch is a bare coloured pill, so without these it has no
                accessible name at all — a screen reader announces "switch, on"
                with no clue which tool it governs. Pointing at the visible
                label rather than duplicating the string in an aria-label keeps
                the two from drifting apart. */}
            <button
              type="button"
              role="switch"
              aria-checked={tool.enabled}
              aria-disabled={tool.disabled}
              aria-labelledby={`${uid}-${tool.id}-name`}
              aria-describedby={`${uid}-${tool.id}-desc`}
              onClick={() => !tool.disabled && onToggle?.(tool.id, !tool.enabled)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                tool.enabled ? "bg-violet-600" : "bg-zinc-200 dark:bg-zinc-700"
              } ${tool.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  tool.enabled ? "translate-x-4" : ""
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
