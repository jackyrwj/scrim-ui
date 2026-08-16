"use client";

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
      strokeWidth="2"
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
      strokeWidth="2.5"
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
      strokeWidth="2.5"
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
    <div className={`rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{description}</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-zinc-400">{emptyText}</p>
      ) : (
        <ul className="max-h-56 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
          {items.map((item) => (
            <li key={item.id} className="group flex items-center gap-3 px-4 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                <SparkleIcon />
              </span>
              <p className="min-w-0 flex-1 text-[13px] leading-5 text-zinc-700 dark:text-zinc-300">
                {item.text}
              </p>
              {item.updatedAt && (
                <span className="shrink-0 text-[11px] text-zinc-400">{item.updatedAt}</span>
              )}
              {onForget && (
                <button
                  type="button"
                  aria-label={`Forget: ${item.text}`}
                  onClick={() => onForget(item.id)}
                  className="shrink-0 rounded-md p-1 text-zinc-300 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                >
                  <XIcon />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add memory */}
      {onAdd && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={addPlaceholder}
            aria-label="Add a memory"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-300"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-zinc-900 px-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <PlusIcon />
            Add
          </button>
        </form>
      )}
    </div>
  );
}
