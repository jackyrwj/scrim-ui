"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20Z" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
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
    <Card className={`gap-0 py-0 overflow-hidden rounded-xl border border-border bg-card transition-colors ${className}`}>
      {/* Header */}
      <Button variant="ghost" size="sm"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="h-auto min-h-8 whitespace-normal justify-start flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <GlobeIcon />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {status === "searching" ? "Searching the web" : "Search the web"}
        </span>
        <span className="hidden shrink-0 truncate text-xs text-muted-foreground sm:block">
          {status === "searching" ? `"${query}"` : `${results.length} results`}
        </span>
        {elapsed && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{elapsed}</span>}
        {status === "searching" ? (
          <Badge variant="secondary" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
            <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
            Searching
          </Badge>
        ) : status === "error" ? (
          <Badge variant="secondary" className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-400">
            Failed
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            {results.length} sources
          </Badge>
        )}
        <span className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronIcon />
        </span>
      </Button>

      {/* Body */}
      {open && (
        <div className="border-t border-border px-3.5 py-3">
          {status === "searching" && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Querying <span className="font-medium text-foreground">“{query}”</span>
              </p>
              {onStop && (
                <Button variant="outline" size="sm"
                  type="button"
                  onClick={onStop}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
                >
                  <StopIcon />
                  Stop
                </Button>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600 dark:text-red-400">
                Search failed — check your network connection.
              </p>
              {onRetry && (
                <Button variant="outline" size="sm"
                  type="button"
                  onClick={onRetry}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                    <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  Retry
                </Button>
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
                    <p className="truncate text-sm font-medium text-foreground group-hover:underline">
                      {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{domainFromUrl(r.url)}</p>
                    {r.snippet && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
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
    </Card>
  );
}
