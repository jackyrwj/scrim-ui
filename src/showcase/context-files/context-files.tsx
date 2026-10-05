"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ContextFile = {
  name: string;
  /** Human size or token detail, e.g. "48 KB" or "≈ 1.2k tokens". */
  detail?: string;
};

export type ContextFilesProps = {
  files: ContextFile[];
  /** Token usage against the context window — renders a progress bar when provided. */
  usage?: { used: number; limit: number };
  onRemove?: (name: string) => void;
  title?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ContextFiles                                                        */
/* ------------------------------------------------------------------ */

export function ContextFiles({
  files,
  usage,
  onRemove,
  title = "Files in context",
  className = "",
}: ContextFilesProps) {
  const used = usage ? Math.min(usage.used / usage.limit, 1) : 0;
  const pct = usage ? Math.round(used * 100) : 0;

  return (
    <div className={`overflow-hidden rounded-xl border border-border ${className}`}>
      <div className="flex items-center justify-between bg-muted px-3 py-2">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">
          {files.length} {files.length === 1 ? "file" : "files"}
          {usage && ` · ${pct}% of context`}
        </span>
      </div>

      {files.length === 0 ? (
        <div className="px-3 py-4 text-center text-xs text-muted-foreground">
          No files in context yet — attach files and they’ll appear here.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {files.map((file) => (
            <li key={file.name} className="flex items-center gap-2.5 px-3 py-2">
              <span className="shrink-0 text-muted-foreground">
                <FileIcon />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {file.name}
              </span>
              {file.detail && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {file.detail}
                </span>
              )}
              {onRemove && (
                <Button variant="ghost" size="icon-sm"
                  type="button"
                  onClick={() => onRemove(file.name)}
                  aria-label={`Remove ${file.name}`}
                  className="min-h-6 min-w-6 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <XIcon />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {usage && (
        <div className="px-3 pb-2.5">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${pct > 85 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
