"use client";

import { Button } from "@/components/ui/button";
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
      <Button variant="ghost" size="icon-sm"
        type="button"
        aria-expanded={open}
        aria-label={`Source ${citation.id}: ${citation.title}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="min-h-6 min-w-6 mx-0.5 inline-flex h-[15px] w-[15px] translate-y-[-2px] items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {citation.id}
      </Button>

      {open && (
        <a
          href={citation.url}
          target="_blank"
          rel="noreferrer noopener"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-xl border border-border bg-card p-3 shadow-md"
        >
          <p className="text-sm font-medium leading-snug text-foreground">
            {citation.title}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">{host}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" className="shrink-0">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </p>
          {citation.snippet && (
            <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
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
      <p className="text-xs font-medium text-muted-foreground">Sources</p>
      <ol className="space-y-1">
        {citations.map((c) => {
          const titleClass =
            "truncate text-muted-foreground transition-colors hover:text-foreground hover:underline";
          return (
            <li key={c.id} className="flex items-baseline gap-2 text-sm">
              <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
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
