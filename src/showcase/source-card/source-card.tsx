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
      className={`group block rounded-xl border border-border shadow-sm bg-card p-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:border-border hover:bg-muted ${className}`}
    >
      <div className="flex items-start gap-3">
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
            className={`flex h-5 w-5 shrink-0 select-none items-center justify-center rounded text-xs font-medium bg-muted text-muted-foreground`}
          >
            {title.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground leading-5">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{host}</p>
          {snippet && (
            <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {snippet}
            </p>
          )}
        </div>
        {index !== undefined && (
          <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
            {index}
          </span>
        )}
      </div>
    </a>
  );
}
