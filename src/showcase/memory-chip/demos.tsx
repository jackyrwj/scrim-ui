"use client";

import { MemoryChip } from "./memory-chip";

export function DemoContext() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100">
        Got it — I will keep your design decisions in mind for future edits.
      </div>
      <div className="flex items-center gap-2">
        <MemoryChip variant="saved" />
        <span className="text-[11px] text-zinc-400">just now</span>
      </div>
    </div>
  );
}

export function DemoOn() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-zinc-400">Status</span>
      <MemoryChip variant="on" label="Memory on · 3 items" />
    </div>
  );
}
