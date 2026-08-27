"use client";

import * as React from "react";
import type { ChunkOptions } from "@/lib/chunk";
import { acceptAttribute, formatBytes, isSupported, MAX_UPLOAD_BYTES } from "@/lib/parse";

/**
 * Getting a document in, and being honest about how long that takes.
 *
 * The demo version of this is a file input and a spinner, and it is fine
 * right up until someone drops a 6MB document on it. Then there is a spinner
 * for nine seconds with nothing to say whether the app is embedding four
 * hundred chunks or has quietly died, and the user reloads the page halfway
 * through — which, on an ingestion pipeline with no idempotency, is the worst
 * thing they could do.
 *
 * So the states are named. Reading, parsing, chunking, embedding: four
 * phases, shown in sequence, each with the file's size beside it so the
 * numbers make sense of the wait. The phases before the request lands are
 * genuinely optimistic — the server reports the real durations only when it
 * answers — and that is a limit worth knowing rather than hiding: the
 * sequence advances on a schedule derived from the file size, and then snaps
 * to the truth. What it never does is claim to be finished before it is.
 *
 * The other half of the job is refusing files early. A 40MB binary should be
 * rejected in the browser, in the same gesture that dropped it, not after a
 * 40MB upload — so the type and size checks run here as well as on the
 * server. Here for the speed of the feedback, there because a browser check
 * is a courtesy and not a control.
 */

export type IngestPhase = "reading" | "parsing" | "chunking" | "embedding";

export type UploaderProps = {
  chunking: ChunkOptions;
  onIngested: (result: IngestResult) => void;
  busy?: boolean;
};

export type IngestResult = {
  document: { id: string; name: string; bytes: number; chunkCount: number; chunking: ChunkOptions };
  text: string;
  chunks: { id: string; index: number; start: number; end: number }[];
  timings: { parse: number; chunk: number; embed: number; total: number };
};

const PHASES: { id: IngestPhase; label: string; detail: string }[] = [
  { id: "reading", label: "Reading", detail: "Getting the bytes off the disk" },
  { id: "parsing", label: "Parsing", detail: "Bytes to text, line endings normalised once" },
  { id: "chunking", label: "Chunking", detail: "Cutting on boundaries, keeping the offsets" },
  { id: "embedding", label: "Embedding", detail: "One batched call — the slow part" },
];

export function Uploader({ chunking, onIngested, busy }: UploaderProps) {
  const [phase, setPhase] = React.useState<IngestPhase>();
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState<{ message: string; hint?: string }>();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const running = phase !== undefined;

  async function ingest(file: File) {
    setError(undefined);

    /* Rejected before the upload starts. Both of these are re-checked on the
       server — see lib/parse.ts — because anything a browser enforces is a
       suggestion. */
    if (file.size > MAX_UPLOAD_BYTES) {
      setError({
        message: `${file.name} is ${formatBytes(file.size)}.`,
        hint: `The limit is ${formatBytes(MAX_UPLOAD_BYTES)}. Split it, or move ingestion to a background job.`,
      });
      return;
    }
    if (!isSupported(file.name)) {
      setError({
        message: `${file.name} is not a text document.`,
        hint: "Text and Markdown work as-is. lib/parse.ts has the seam for PDFs — two lines and an extractor.",
      });
      return;
    }

    setPhase("reading");
    /* The optimistic sequence. Timed off the file's size because that is what
       actually predicts the wait, and cleared the moment the response lands —
       so a fast document never sits on "embedding" for show. */
    const stops = scheduleFor(file.size, setPhase);

    const form = new FormData();
    form.set("file", file);
    form.set("chunking", JSON.stringify(chunking));

    try {
      const response = await fetch("/api/ingest", { method: "POST", body: form });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const { error: message, hint } = (payload ?? {}) as { error?: string; hint?: string };
        setError({ message: message ?? "Ingestion failed.", hint });
        return;
      }
      onIngested(payload as IngestResult);
    } catch {
      setError({
        message: "The upload did not reach the server.",
        hint: "Check the dev server is running, then try again — nothing was stored.",
      });
    } finally {
      stops();
      setPhase(undefined);
      /* So dropping the same file twice fires a change event the second
         time. Without it, re-uploading after an error silently does nothing. */
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!running) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file && !running && !busy) void ingest(file);
        }}
        data-dragging={dragging ? "" : undefined}
        className="rounded-xl border border-dashed border-zinc-300 p-5 text-center transition-colors data-dragging:border-zinc-900 data-dragging:bg-zinc-50 dark:border-zinc-700 dark:data-dragging:border-zinc-100 dark:data-dragging:bg-zinc-900"
      >
        {running ? (
          <PhaseList current={phase} />
        ) : (
          <>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
              Drop a document here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="font-medium text-zinc-900 underline underline-offset-2 disabled:opacity-50 dark:text-zinc-100"
              >
                choose a file
              </button>
              .
            </p>
            <p className="mt-1 text-[11px] text-zinc-400">
              Text and Markdown, up to {formatBytes(MAX_UPLOAD_BYTES)}.
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={acceptAttribute()}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void ingest(file);
          }}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-left dark:border-red-900/50 dark:bg-red-950/30"
        >
          <p className="text-[13px] font-medium text-red-900 dark:text-red-200">{error.message}</p>
          {/* The hint is the whole reason this is not a toast. Every error
              here has a specific next action, and a message that disappears
              after four seconds is one the reader has to reproduce to read. */}
          {error.hint && (
            <p className="mt-1 text-[12px] leading-5 text-red-700 dark:text-red-300">{error.hint}</p>
          )}
        </div>
      )}
    </div>
  );
}

function PhaseList({ current }: { current: IngestPhase }) {
  const index = PHASES.findIndex((p) => p.id === current);
  return (
    <ol className="space-y-1.5 text-left">
      {PHASES.map((phase, i) => {
        const state = i < index ? "done" : i === index ? "active" : "waiting";
        return (
          <li key={phase.id} className="flex items-start gap-2.5">
            <span className="mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center" aria-hidden>
              {state === "done" ? (
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-emerald-600">
                  <path d="M4 12l5 5L20 6" />
                </svg>
              ) : state === "active" ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-900 dark:bg-zinc-100" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              )}
            </span>
            <span className="min-w-0">
              <span
                className={`block text-[12px] font-medium ${
                  state === "waiting" ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {phase.label}
              </span>
              {state === "active" && (
                <span className="block text-[11px] leading-4 text-zinc-500">{phase.detail}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The optimistic phase advance.
 *
 * Derived from file size rather than fixed, because the point of showing
 * phases at all is that they take different amounts of time on different
 * files. Reading and parsing are near-instant on anything a browser will
 * hold; chunking scales with length; embedding is network and dominates.
 * These are pacing constants, not measurements — the real numbers come back
 * with the response and are shown in the chunking panel.
 */
function scheduleFor(bytes: number, setPhase: (phase: IngestPhase) => void): () => void {
  const kb = bytes / 1024;
  const timers = [
    window.setTimeout(() => setPhase("parsing"), 150),
    window.setTimeout(() => setPhase("chunking"), 150 + Math.min(1200, kb * 2)),
    window.setTimeout(() => setPhase("embedding"), 350 + Math.min(1800, kb * 3)),
  ];
  return () => timers.forEach(window.clearTimeout);
}
