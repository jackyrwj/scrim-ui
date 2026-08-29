"use client";

import * as React from "react";

/**
 * The result card for generated media — images, audio, video.
 *
 * The rules this component holds:
 *
 * **Progress is a stage, never a fake percentage.** The model does not know
 * it is "63% done", and a bar that sprints to 90% then stalls teaches the
 * user to distrust every honest bar after it. Queued shows a queue position;
 * generating shows the current stage in words.
 *
 * **Blocked is not failed.** A safety refusal (content policy) and an
 * infrastructure failure look identical if both render a red box — but one
 * asks the user to rephrase and the other asks them to retry. They get
 * different surfaces, different copy, and different actions.
 *
 * **The media's accessibility is a prop, not an afterthought.** The host
 * hands in the `<img alt>`, `<audio>` or `<video>` element; this frame
 * carries the caption and, when the media can't render, a labelled
 * fallback instead of a broken-icon rectangle.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type MediaKind = "image" | "audio" | "video";

/** `blocked` is a safety refusal — distinct from `failed` on purpose. */
export type MediaStatus = "queued" | "generating" | "ready" | "failed" | "cancelled" | "blocked";

export type MediaVariant = {
  id: string;
  label?: string;
};

export type GeneratedMediaResultProps = {
  kind: MediaKind;
  status: MediaStatus;
  /** The prompt that produced it — always visible, so a result is re-usable. */
  prompt: string;
  /** Key generation parameters, e.g. ["1024×1024", "seed 42"]. */
  params?: string[];
  /** Current stage while generating, in words — "Upsampling", never "63%". */
  stage?: string;
  /** Position in line while queued. */
  queuePosition?: number;
  /** The media element — <img>, <audio controls>, <video controls>. Rendered only when ready. */
  children?: React.ReactNode;
  /** Text fallback when a ready result has no media element to show. */
  mediaAlt?: string;
  caption?: string;
  variants?: MediaVariant[];
  currentVariantId?: string;
  onVariantChange?: (id: string) => void;
  errorMessage?: string;
  /** Why the safety system refused — phrased to help the user rephrase. */
  blockedReason?: string;
  onDownload?: () => void;
  onRegenerate?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function ImageIcon() {
  return (
    <svg {...ICON_PROPS} width="15" height="15">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg {...ICON_PROPS} width="15" height="15">
      <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg {...ICON_PROPS} width="15" height="15">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...ICON_PROPS} width="20" height="20">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg {...ICON_PROPS} width="20" height="20">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12.01" x2="12" y1="16" y2="16" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg {...ICON_PROPS} width="14" height="14">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function RegenerateIcon() {
  return (
    <svg {...ICON_PROPS} width="14" height="14">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...ICON_PROPS} width="14" height="14">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

const KIND_META: Record<MediaKind, { label: string; icon: React.ReactNode }> = {
  image: { label: "Image", icon: <ImageIcon /> },
  audio: { label: "Audio", icon: <AudioIcon /> },
  video: { label: "Video", icon: <VideoIcon /> },
};

/* ------------------------------------------------------------------ */
/* GeneratedMediaResult                                                */
/* ------------------------------------------------------------------ */

export function GeneratedMediaResult({
  kind,
  status,
  prompt,
  params = [],
  stage,
  queuePosition,
  children,
  mediaAlt,
  caption,
  variants,
  currentVariantId,
  onVariantChange,
  errorMessage,
  blockedReason,
  onDownload,
  onRegenerate,
  onCancel,
  onRetry,
  className = "",
}: GeneratedMediaResultProps) {
  const meta = KIND_META[kind];
  const running = status === "queued" || status === "generating";

  const actionCls =
    "inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

  return (
    <figure
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {/* Header — wraps on narrow cards; actions are never squeezed off. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800/60">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-700 dark:text-zinc-200">
          <span className="text-zinc-400 dark:text-zinc-500">{meta.icon}</span>
          {meta.label}
        </span>
        {status === "generating" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            Generating
          </span>
        )}
        {status === "queued" && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Queued{queuePosition != null ? ` · #${queuePosition}` : ""}
          </span>
        )}
        {status === "failed" && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-950/60 dark:text-red-400">
            Failed
          </span>
        )}
        {status === "blocked" && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            Blocked by policy
          </span>
        )}
        {status === "cancelled" && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Cancelled
          </span>
        )}

        <span className="ml-auto flex items-center gap-1.5">
          {running && onCancel && (
            <button type="button" onClick={onCancel} className={actionCls}>
              <XIcon />
              Cancel
            </button>
          )}
          {status === "failed" && onRetry && (
            <button type="button" onClick={onRetry} className={actionCls}>
              <RegenerateIcon />
              Retry
            </button>
          )}
          {(status === "ready" || status === "cancelled") && onRegenerate && (
            <button type="button" onClick={onRegenerate} className={actionCls}>
              <RegenerateIcon />
              Regenerate
            </button>
          )}
          {status === "ready" && onDownload && (
            <button type="button" onClick={onDownload} className={actionCls}>
              <DownloadIcon />
              Download
            </button>
          )}
        </span>
      </div>

      {/* Body — fixed minimum height so status flips don't shove the page. */}
      <div className="flex min-h-[220px] items-center justify-center bg-zinc-50 dark:bg-zinc-950/40">
        {status === "queued" && (
          <div className="px-6 py-10 text-center">
            <p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
              {queuePosition != null ? `#${queuePosition} in the queue` : "Waiting for a slot"}
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Generation starts as soon as a worker is free.</p>
          </div>
        )}

        {status === "generating" && (
          <div className="w-full px-6 py-10">
            <div className="mx-auto max-w-[280px] space-y-2">
              <div className="h-28 animate-pulse rounded-lg bg-zinc-200/70 dark:bg-zinc-800" />
              <div className="h-2.5 w-2/3 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800" />
              <div className="h-2.5 w-1/3 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800" />
            </div>
            <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {stage ?? "Generating…"}
            </p>
          </div>
        )}

        {status === "ready" &&
          (children ?? (
            <div className="px-6 py-10 text-center">
              <span className="mx-auto block w-fit text-zinc-300 dark:text-zinc-600">{meta.icon}</span>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {mediaAlt ?? `The ${meta.label.toLowerCase()} could not be displayed.`}
              </p>
            </div>
          ))}

        {status === "failed" && (
          <div className="px-6 py-10 text-center">
            <span className="mx-auto block w-fit text-red-400 dark:text-red-500">
              <ErrorIcon />
            </span>
            <p className="mt-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-200">Generation failed</p>
            <p className="mx-auto mt-1 max-w-[320px] text-xs text-zinc-500 dark:text-zinc-400">
              {errorMessage ?? "The worker stopped mid-generation. Nothing was charged — retry to start over."}
            </p>
          </div>
        )}

        {status === "blocked" && (
          <div className="px-6 py-10 text-center">
            <span className="mx-auto block w-fit text-amber-500 dark:text-amber-400">
              <ShieldIcon />
            </span>
            <p className="mt-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-200">
              Blocked by the content policy
            </p>
            <p className="mx-auto mt-1 max-w-[320px] text-xs text-zinc-500 dark:text-zinc-400">
              {blockedReason ?? "The prompt was refused before generation started. Rephrase it and try again — this is not a retryable error."}
            </p>
          </div>
        )}

        {status === "cancelled" && (
          <div className="px-6 py-10 text-center">
            <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">Cancelled before it finished</p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Nothing was charged. Regenerate to start over.</p>
          </div>
        )}
      </div>

      {/* Footer — the prompt is the re-use path, so it is always visible. */}
      <figcaption className="border-t border-zinc-100 px-3 py-2 dark:border-zinc-800/60">
        <p className="truncate text-xs text-zinc-600 dark:text-zinc-300" title={prompt}>
          “{prompt}”
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {params.map((p) => (
            <span
              key={p}
              className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {p}
            </span>
          ))}
          {variants && variants.length > 1 && (
            <span className="ml-auto flex items-center gap-1" role="group" aria-label="Variants">
              {variants.map((v, i) => {
                const active = v.id === currentVariantId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onVariantChange?.(v.id)}
                    aria-pressed={active}
                    aria-label={v.label ?? `Variant ${i + 1}`}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      active
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "border border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {v.label ?? `${i + 1}`}
                  </button>
                );
              })}
            </span>
          )}
        </div>
        {caption && <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">{caption}</p>}
      </figcaption>
    </figure>
  );
}
