"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type MemoryItem = {
  id: string;
  text: string;
  updatedAt?: string;
};

export type MemoryListProps = {
  items: MemoryItem[];
  title?: string;
  description?: string;
  addPlaceholder?: string;
  emptyText?: string;
  onAdd?: (text: string) => void;
  onForget?: (id: string) => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      {...props}
    >
      <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* MemoryList                                                          */
/* ------------------------------------------------------------------ */

export function MemoryList({
  items,
  title = "Memory",
  description = "Things the assistant remembers about you",
  addPlaceholder = "Add a memory…",
  emptyText = "No memories yet.",
  onAdd,
  onForget,
  className = "",
}: MemoryListProps) {
  const [draft, setDraft] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !onAdd) return;
    onAdd(text);
    setDraft("");
  }

  return (
    <Card className={`gap-0 py-0 rounded-xl border border-border bg-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary" className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="max-h-56 divide-y divide-border overflow-y-auto">
          {items.map((item) => (
            <li key={item.id} className="group flex items-center gap-3 px-4 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <SparkleIcon />
              </span>
              <p className="min-w-0 flex-1 text-sm leading-5 text-foreground">
                {item.text}
              </p>
              {item.updatedAt && (
                <span className="shrink-0 text-xs text-muted-foreground">{item.updatedAt}</span>
              )}
              {onForget && (
                <Button variant="ghost" size="icon-sm"
                  type="button"
                  aria-label={`Forget: ${item.text}`}
                  onClick={() => onForget(item.id)}
                  className="min-h-6 min-w-6 shrink-0 rounded-md p-1 text-muted-foreground opacity-100 transition-opacity hover:bg-muted hover:text-muted-foreground group-hover:opacity-100"
                >
                  <XIcon />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add memory */}
      {onAdd && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-border px-4 py-3"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={addPlaceholder}
            aria-label="Add a memory"
            className="min-w-0 flex-1 bg-transparent text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <Button variant="default" size="sm"
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <PlusIcon />
            Add
          </Button>
        </form>
      )}
    </Card>
  );
}
