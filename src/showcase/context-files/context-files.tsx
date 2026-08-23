"use client";

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
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
    <div className={`overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <div className="flex items-center justify-between bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
        <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{title}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {files.length} {files.length === 1 ? "file" : "files"}
          {usage && ` · ${pct}% of context`}
        </span>
      </div>

      {files.length === 0 ? (
        <div className="px-3 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          No files in context yet — attach files and they’ll appear here.
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {files.map((file) => (
            <li key={file.name} className="flex items-center gap-2.5 px-3 py-2">
              <span className="shrink-0 text-zinc-400 dark:text-zinc-500">
                <FileIcon />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-700 dark:text-zinc-200">
                {file.name}
              </span>
              {file.detail && (
                <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {file.detail}
                </span>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(file.name)}
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <XIcon />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {usage && (
        <div className="px-3 pb-2.5">
          <div className="h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
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
