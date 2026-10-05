"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ModelOption = {
  id: string;
  name: string;
  hint: string;
  badges?: string[];
  /**
   * Optional leading mark, e.g. the provider's logo. A slot rather than a
   * built-in lookup so this component stays dependency-free — pass whatever
   * icon element you already have.
   */
  icon?: React.ReactNode;
};

export type ModelSelectorProps = {
  options: ModelOption[];
  value?: string;
  onSelect?: (id: string) => void;
  placeholder?: string;
  defaultOpen?: boolean;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="12"
      height="12"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ModelSelector                                                       */
/* ------------------------------------------------------------------ */

export function ModelSelector({
  options,
  value,
  onSelect,
  placeholder = "Choose a model",
  defaultOpen = false,
  className = "",
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const selected = options.find((o) => o.id === value) ?? options[0];

  return (
    <div className={`relative ${className}`}>
      <Button variant="outline" size="sm"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-auto min-h-8 whitespace-normal justify-start inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium">
            {selected?.name ?? placeholder}
          </span>
          {selected?.badges?.[0] && (
            <Badge variant="secondary" className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {selected.badges[0]}
            </Badge>
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="14"
          height="14"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* A div, not a ul: role="listbox" overrides the ul's implicit list
              role, which makes every <li> inside it an orphaned listitem, and
              role="option" must be a *direct* child of the listbox — the <li>
              wrapper broke that too. Buttons are not valid children of <ul>
              anyway. */}
          <div
            role="listbox"
            aria-label="Model"
            className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-md"
          >
            {options.map((opt) => {
              const active = opt.id === selected?.id;
              return (
                <Button variant="ghost" size="sm"
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onSelect?.(opt.id);
                    setOpen(false);
                  }}
                  className={`h-auto min-h-8 whitespace-normal justify-start flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-muted ${
                    active ? "bg-muted" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {opt.icon}
                      <span className="text-sm font-medium text-foreground">
                        {opt.name}
                      </span>
                      {active && (
                        <span className="text-muted-foreground">
                          <CheckIcon />
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {opt.hint}
                    </p>
                  </div>
                  {opt.badges && opt.badges.length > 0 && (
                    <div className="flex shrink-0 flex-wrap items-center gap-1 pt-0.5">
                      {opt.badges.map((b) => (
                        <Badge variant="secondary"
                          key={b}
                          className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {b}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
