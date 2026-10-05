"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className={`gap-0 py-0 rounded-xl border border-border bg-card ${className}`}>
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      <ul className="divide-y divide-border">
        {tools.map((tool) => (
          <li key={tool.id} className="flex items-center gap-3 px-4 py-3">
            {tool.icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {tool.icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p
                id={`${uid}-${tool.id}-name`}
                className="text-sm font-medium text-foreground"
              >
                {tool.name}
              </p>
              <p
                id={`${uid}-${tool.id}-desc`}
                className="mt-0.5 text-xs text-muted-foreground"
              >
                {tool.description}
              </p>
            </div>
            {/* The switch is a bare coloured pill, so without these it has no
                accessible name at all — a screen reader announces "switch, on"
                with no clue which tool it governs. Pointing at the visible
                label rather than duplicating the string in an aria-label keeps
                the two from drifting apart. */}
            <Button variant="ghost" size="sm"
              type="button"
              role="switch"
              aria-checked={tool.enabled}
              aria-disabled={tool.disabled}
              aria-labelledby={`${uid}-${tool.id}-name`}
              aria-describedby={`${uid}-${tool.id}-desc`}
              onClick={() => !tool.disabled && onToggle?.(tool.id, !tool.enabled)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                tool.enabled ? "bg-primary" : "bg-muted"
              } ${tool.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  tool.enabled ? "translate-x-4" : ""
                }`}
              />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
