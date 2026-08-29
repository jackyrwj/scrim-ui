"use client";

import * as React from "react";

/**
 * The version navigator that appears after a regenerate.
 *
 * Message Actions can fire "regenerate", but what happens next is usually
 * left broken: the old answer is overwritten, or the new one shoves the
 * reader somewhere they did not ask to go. This component owns the state
 * model for what comes after:
 *
 * **Versions are identified by id, never by array position.** The caller
 * passes a stable `id` per version; the pager's "2 / 3" is display only.
 * Retries and branches append — nothing is ever overwritten in place.
 *
 * **A new version must not steal the reader's place.** The navigator
 * auto-advances to an arriving version only while the reader is already
 * sitting on the newest one. Someone paging back through v1 while v4
 * streams in stays on v1; the pager badge tells them something new landed.
 *
 * **A failed version keeps its partial content.** The half-written answer
 * is often still useful, and it is always evidence. It stays on screen
 * under the failure notice instead of vanishing.
 *
 * **Branching is marked, not diagrammed.** When a version was created off
 * an older one (an edited prompt, a continue-from-here), a chip names the
 * parent. A full branch tree is a pattern-level concern.
 */

export type ResponseVersionStatus = "ready" | "generating" | "failed" | "stopped";

export type ResponseVersion = {
  id: string;
  content: React.ReactNode;
  status?: ResponseVersionStatus;
  /** Id of the version this one was branched off, if any. */
  branchedFrom?: string;
};

export type ResponseVersionsProps = {
  versions: ResponseVersion[];
  /** Seeds the navigator. After that, position is internal state. */
  defaultCurrentId?: string;
  onVersionChange?: (id: string) => void;
  /** Ask the caller for another version. Appending it is the caller's job. */
  onRegenerate?: () => void;
  /** Continue the conversation from a version that is not the latest. */
  onContinueFrom?: (id: string) => void;
  /** Open a comparison of the current version against another. */
  onCompare?: (currentId: string) => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function BranchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" {...props}>
      <path d="M6 3v12" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function RegenerateIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ResponseVersions                                                    */
/* ------------------------------------------------------------------ */

export function ResponseVersions({
  versions,
  defaultCurrentId,
  onVersionChange,
  onRegenerate,
  onContinueFrom,
  onCompare,
  className = "",
}: ResponseVersionsProps) {
  const lastId = versions.length > 0 ? versions[versions.length - 1].id : undefined;
  const [currentId, setCurrentId] = React.useState(defaultCurrentId ?? lastId);

  /* Auto-follow the newest version, but only while the reader is already
     there. Render-phase adjustment: when the versions array gains a new
     tail, advance iff the previous tail was the one on screen. A reader
     paging through older versions is never yanked forward. */
  const [followed, setFollowed] = React.useState(lastId);
  if (lastId !== followed) {
    setFollowed(lastId);
    if (currentId === followed && lastId) setCurrentId(lastId);
  }

  if (versions.length === 0) return null;
  const current = versions.find((v) => v.id === currentId) ?? versions[versions.length - 1];
  const index = versions.indexOf(current);
  const status = current.status ?? "ready";
  const branchIndex = current.branchedFrom
    ? versions.findIndex((v) => v.id === current.branchedFrom)
    : -1;

  function go(id: string) {
    setCurrentId(id);
    onVersionChange?.(id);
  }

  const navBtn =
    "rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

  return (
    <div className={className}>
      {status === "generating" && (
        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          Generating a new version…
        </p>
      )}

      <div>{current.content}</div>

      {status === "failed" && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/50 dark:bg-red-950/40">
          <span className="text-xs text-red-700 dark:text-red-300">
            This version failed to finish — the partial answer is kept above.
          </span>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="shrink-0 rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              Retry
            </button>
          )}
        </div>
      )}
      {status === "stopped" && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Stopped — this version is incomplete.
        </p>
      )}

      {(versions.length > 1 || onRegenerate) && (
        <div role="group" aria-label="Response versions" className="mt-2 flex items-center gap-1">
          {versions.length > 1 && (
            <>
              <button
                type="button"
                aria-label={`Previous version (${index} of ${versions.length})`}
                disabled={index === 0}
                onClick={() => go(versions[index - 1].id)}
                className={navBtn}
              >
                <ChevronLeftIcon />
              </button>
              <span
                aria-live="polite"
                className="min-w-9 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400"
              >
                {index + 1} / {versions.length}
              </span>
              <button
                type="button"
                aria-label={`Next version (${index + 2} of ${versions.length})`}
                disabled={index === versions.length - 1}
                onClick={() => go(versions[index + 1].id)}
                className={navBtn}
              >
                <ChevronRightIcon />
              </button>
              {branchIndex >= 0 && (
                <span className="ml-1 flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <BranchIcon />
                  from v{branchIndex + 1}
                </span>
              )}
            </>
          )}

          <span className="flex-1" />

          {onCompare && versions.filter((v) => (v.status ?? "ready") === "ready").length > 1 && (
            <button
              type="button"
              onClick={() => onCompare(current.id)}
              className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              Compare
            </button>
          )}
          {index < versions.length - 1 && onContinueFrom && status === "ready" && (
            <button
              type="button"
              onClick={() => onContinueFrom(current.id)}
              className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              Continue from here
            </button>
          )}
          {onRegenerate && status !== "failed" && (
            <button
              type="button"
              aria-label="Regenerate response"
              onClick={onRegenerate}
              className={navBtn}
            >
              <RegenerateIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
