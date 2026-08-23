"use client";

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
      strokeWidth="2.5"
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium">{selected?.name ?? placeholder}</span>
          {selected?.badges?.[0] && (
            <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {selected.badges[0]}
            </span>
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="14"
          height="14"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            {options.map((opt) => {
              const active = opt.id === selected?.id;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onSelect?.(opt.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                      active ? "bg-zinc-50 dark:bg-zinc-800" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {opt.icon}
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {opt.name}
                        </span>
                        {active && (
                          <span className="text-violet-600 dark:text-violet-400">
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{opt.hint}</p>
                    </div>
                    {opt.badges && opt.badges.length > 0 && (
                      <div className="flex shrink-0 flex-wrap items-center gap-1 pt-0.5">
                        {opt.badges.map((b) => (
                          <span
                            key={b}
                            className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
