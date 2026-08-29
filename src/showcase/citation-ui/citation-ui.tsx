"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Citation = {
  id: number;
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
};

export type InlineCitationProps = {
  citation: Citation;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/* ------------------------------------------------------------------ */
/* InlineCitation                                                      */
/* ------------------------------------------------------------------ */

export function InlineCitation({ citation, className = "" }: InlineCitationProps) {
  const [open, setOpen] = React.useState(false);
  const host = citation.domain ?? domainFromUrl(citation.url);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Source ${citation.id}: ${citation.title}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="mx-0.5 inline-flex h-[15px] w-[15px] translate-y-[-2px] items-center justify-center rounded-full bg-zinc-200 text-[9px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-white dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
      >
        {citation.id}
      </button>

      {open && (
        <a
          href={citation.url}
          target="_blank"
          rel="noreferrer noopener"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
        >
          <p className="text-sm font-medium leading-snug text-zinc-800 dark:text-zinc-100">
            {citation.title}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="truncate">{host}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" className="shrink-0">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </p>
          {citation.snippet && (
            <p className="mt-1.5 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
              {citation.snippet}
            </p>
          )}
        </a>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* CitationList — numbered source list rendered under an answer        */
/* ------------------------------------------------------------------ */

export function CitationList({
  citations,
  className = "",
  linkable = true,
}: {
  citations: Citation[];
  className?: string;
  /** False inside a card already wrapped in <a>, where nested anchors are invalid HTML. */
  linkable?: boolean;
}) {
  if (citations.length === 0) return null;
  return (
    <div className={`space-y-1.5 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Sources</p>
      <ol className="space-y-1">
        {citations.map((c) => {
          const titleClass =
            "truncate text-zinc-600 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-100";
          return (
            <li key={c.id} className="flex items-baseline gap-2 text-sm">
              <span className="w-4 shrink-0 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                {c.id}
              </span>
              {linkable ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={titleClass}
                >
                  {c.title}
                </a>
              ) : (
                <span className={titleClass}>{c.title}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
