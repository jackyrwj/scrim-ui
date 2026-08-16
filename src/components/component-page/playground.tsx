"use client";

import * as React from "react";

/**
 * Shared layout + controls for component-page playgrounds.
 * A playground is a live demo paired with a parameter panel, so visitors
 * can tweak props and watch the component react — Preview First, turned
 * into "Play First".
 */

export function Playground({
  title = "Live demo",
  demo,
  controls,
}: {
  title?: string;
  demo: React.ReactNode;
  controls: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* Live demo */}
      <div className="overflow-hidden rounded-xl border border-(--border) bg-(--card)">
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-2.5">
          <span className="text-xs font-medium text-(--muted-foreground)">{title}</span>
          <span className="text-xs text-(--muted-foreground)">updates as you change the props</span>
        </div>
        <div className="flex items-center justify-center bg-(--muted)/50 px-4 py-10 sm:px-8">
          <div className="w-full max-w-xl">{demo}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-fit rounded-xl border border-(--border) bg-(--card) p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
          Controls
        </h3>
        <div className="mt-4 space-y-4">{controls}</div>
      </div>
    </div>
  );
}

export function PField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-(--muted-foreground)">{label}</span>
      {children}
    </label>
  );
}

export const pInputCls =
  "w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none transition-colors focus:border-(--foreground)";

export function PToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-sm"
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-(--foreground)" : "bg-(--muted)"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-(--background) shadow-sm transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
