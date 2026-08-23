"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SearchResult = {
  title: string;
  url: string;
  snippet?: string;
};

export type SearchToolCallProps = {
  query: string;
  status?: "searching" | "done" | "error";
  results?: SearchResult[];
  elapsed?: string;
  onStop?: () => void;
  onRetry?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20Z" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function StopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/* ------------------------------------------------------------------ */
/* SearchToolCall                                                      */
/* ------------------------------------------------------------------ */

export function SearchToolCall({
  query,
  status = "searching",
  results = [],
  elapsed,
  onStop,
  onRetry,
  className = "",
}: SearchToolCallProps) {
  const [open, setOpen] = React.useState(status === "done");

  return (
    <div className={`overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <GlobeIcon />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {status === "searching" ? "Searching the web" : "Search the web"}
        </span>
        <span className="hidden shrink-0 truncate text-xs text-zinc-500 dark:text-zinc-400 sm:block">
          {status === "searching" ? `"${query}"` : `${results.length} results`}
        </span>
        {elapsed && <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{elapsed}</span>}
        {status === "searching" ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
            <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
            Searching
          </span>
        ) : status === "error" ? (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-700 dark:bg-red-900/40 dark:text-red-400">
            Failed
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            {results.length} sources
          </span>
        )}
        <span className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronIcon />
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-zinc-100 px-3.5 py-3 dark:border-zinc-800">
          {status === "searching" && (
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                Querying <span className="font-medium text-zinc-700 dark:text-zinc-200">“{query}”</span>
              </p>
              {onStop && (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <StopIcon />
                  Stop
                </button>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-red-600 dark:text-red-400">
                Search failed — check your network connection.
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                    <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  Retry
                </button>
              )}
            </div>
          )}

          {status === "done" && (
            <ul className="space-y-2.5">
              {results.map((r, i) => (
                <li key={i}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group block"
                  >
                    <p className="truncate text-sm font-medium text-zinc-800 group-hover:underline dark:text-zinc-100">
                      {r.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{domainFromUrl(r.url)}</p>
                    {r.snippet && (
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-zinc-500 dark:text-zinc-400">
                        {r.snippet}
                      </p>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
