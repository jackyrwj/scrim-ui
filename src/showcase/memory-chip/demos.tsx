"use client";

import { MemoryChip } from "./memory-chip";

export function DemoContext() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm leading-6 text-foreground">
        Got it — I will keep your design decisions in mind for future edits.
      </div>
      <div className="flex items-center gap-2">
        <MemoryChip variant="saved" />
        <span className="text-xs text-muted-foreground">just now</span>
      </div>
    </div>
  );
}

export function DemoOn() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Status</span>
      <MemoryChip variant="on" label="Memory on · 3 items" />
    </div>
  );
}
