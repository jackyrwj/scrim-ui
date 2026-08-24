"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ErrorMessageProps = {
  title?: string;
  message: string;
  /** Show an inline retry action. */
  onRetry?: () => void;
  /** True while a retry is in flight — shows a spinner instead of the button. */
  retrying?: boolean;
  /** Seconds until retry is allowed — shows a countdown when > 0. */
  retryCountdown?: number;
  /** One of "error" | "rate-limit" | "warning" — changes the icon and tint. */
  severity?: "error" | "rate-limit" | "warning";
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function TriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M12 14l4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ErrorMessage                                                        */
/* ------------------------------------------------------------------ */

export function ErrorMessage({
  title,
  message,
  onRetry,
  retrying = false,
  retryCountdown = 0,
  severity = "error",
  className = "",
}: ErrorMessageProps) {
  const isRateLimit = severity === "rate-limit";
  const Icon = isRateLimit ? GaugeIcon : TriangleIcon;
  const tint = isRateLimit
    ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className={`flex items-start gap-3 rounded-2xl rounded-tl-md border border-red-200 bg-red-50/60 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30 ${className}`}>
      <span className={`mt-0.5 shrink-0 ${tint}`}>
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {title ?? (isRateLimit ? "Slow down a bit" : "Something went wrong")}
        </div>
        <p className="mt-0.5 text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">{message}</p>

        {onRetry && !retrying && retryCountdown === 0 && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RetryIcon />
            Retry
          </button>
        )}

        {/* zinc-600 on both captions below: they sit on the tinted error
            surface, where zinc-500 measures 4.49:1 — a hair under AA at 12px. */}
        {retrying && (
          <div className="mt-2 inline-flex h-7 items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
            Retrying…
          </div>
        )}

        {!retrying && retryCountdown > 0 && (
          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Try again in {retryCountdown}s
          </div>
        )}
      </div>
    </div>
  );
}
