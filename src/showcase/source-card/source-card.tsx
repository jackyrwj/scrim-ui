"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SourceCardProps = {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  favicon?: string;
  index?: number;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const FALLBACK_COLORS = [
  "bg-slate-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function colorFor(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/* ------------------------------------------------------------------ */
/* SourceCard                                                          */
/* ------------------------------------------------------------------ */

export function SourceCard({
  title,
  url,
  domain,
  snippet,
  favicon,
  index,
  className = "",
}: SourceCardProps) {
  const host = domain ?? domainFromUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className={`group block rounded-xl border border-zinc-200 bg-white p-3.5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        {favicon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={favicon}
            alt=""
            className="h-5 w-5 shrink-0 rounded"
            width={20}
            height={20}
          />
        ) : (
          <span
            className={`flex h-5 w-5 shrink-0 select-none items-center justify-center rounded text-[9px] font-bold text-white ${colorFor(title)}`}
          >
            {title.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-800 group-hover:underline dark:text-zinc-100">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{host}</p>
          {snippet && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
              {snippet}
            </p>
          )}
        </div>
        {index !== undefined && (
          <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-100 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {index}
          </span>
        )}
      </div>
    </a>
  );
}
