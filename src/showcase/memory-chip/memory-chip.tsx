"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type MemoryChipProps = {
  variant?: "saved" | "on";
  label?: string;
  onClick?: () => void;
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
      width="11"
      height="11"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* MemoryChip                                                          */
/* ------------------------------------------------------------------ */

export function MemoryChip({
  variant = "saved",
  label,
  onClick,
  className = "",
}: MemoryChipProps) {
  const saved = variant === "saved";
  const text = label ?? (saved ? "Saved to memory" : "Memory on");

  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={`inline-flex h-6 max-w-full items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-colors ${
        saved
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/25 dark:text-emerald-300"
          : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      } ${onClick ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700" : ""} ${className}`}
    >
      {saved ? <CheckIcon /> : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      <span className="truncate">{text}</span>
    </Comp>
  );
}
