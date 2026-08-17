"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Shared building blocks for first-party /tools pages.                */
/* Kept byte-for-byte identical to the helpers they were extracted     */
/* from (chat-mockup) so existing tools render exactly the same.       */
/* ------------------------------------------------------------------ */

export const inputCls =
  "w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none transition-colors focus:border-(--foreground)";
export const selectCls = `${inputCls} appearance-none`;

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-(--muted-foreground)">{label}</span>
      {children}
    </label>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-(--border) bg-(--card) p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-(--foreground) text-(--background)"
          : "border border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
      }`}
    >
      {children}
    </button>
  );
}
