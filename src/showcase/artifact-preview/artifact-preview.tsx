"use client";

import * as React from "react";

/**
 * The side panel for generated output — Claude's artifact, ChatGPT's canvas.
 *
 * **The trust boundary is the whole design.** This component never executes
 * anything. The preview is a React node the *caller* rendered; the source is
 * a string the component only ever prints, copies and downloads. There is no
 * `dangerouslySetInnerHTML`, no `eval`, no dynamic import of a model-named
 * module. If the artifact is a runnable web page, the caller renders it
 * inside its own sandboxed iframe and hands the iframe over as `preview` —
 * sandboxing is the host application's job, deliberately.
 *
 * **The chrome must not move while content streams.** Header, view toggle
 * and actions are stable from the first token; an indeterminate bar under
 * the header carries the "still generating" signal, and an empty streaming
 * artifact gets a fixed-height shimmer rather than a collapsing panel.
 *
 * **Error is a state of the panel, not the end of the conversation.** A
 * failed render replaces the preview with a plain-language fallback — the
 * source stays readable in the Code view, and nothing here throws.
 *
 * What this component is not: it does not run code (Code Execution), review
 * edits hunk by hunk (Edit Diff View), or render a tool result inline in the
 * message stream (Generative UI). It is the passive surface those write to.
 */

export type ArtifactType = "code" | "document" | "web" | "chart" | "image";
export type ArtifactStatus = "streaming" | "ready" | "error" | "stale";
export type ArtifactView = "preview" | "code";

export type ArtifactVersion = {
  id: string;
  label?: string;
};

export type ArtifactPreviewProps = {
  title: string;
  type?: ArtifactType;
  status?: ArtifactStatus;
  /** Caller-rendered preview. Never executed by this component. */
  preview?: React.ReactNode;
  /** The artifact's source. Enables the Code view, Copy and Download. */
  code?: string;
  /** Label for the source language, e.g. "TSX". Drives the download extension. */
  language?: string;
  defaultView?: ArtifactView;
  versions?: ArtifactVersion[];
  currentVersionId?: string;
  onVersionChange?: (id: string) => void;
  errorMessage?: string;
  /** Note shown on the "stale" badge, e.g. which prompt it is stale against. */
  staleNote?: string;
  onDownload?: () => void;
  onFullscreen?: () => void;
  onOpenExternal?: () => void;
  onClose?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="13" height="13" {...props}>
      <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}

function DocumentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="13" height="13" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

function WebIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="13" height="13" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="13" height="13" {...props}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 13l3-3 4 4 5-6" />
    </svg>
  );
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="13" height="13" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </svg>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="12" height="12" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="13" height="13" {...props}>
      <rect width="13" height="13" x="9" y="9" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} strokeWidth={3} width="12" height="12" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="13" height="13" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function FullscreenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="13" height="13" {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function ExternalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="13" height="13" {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} strokeWidth={2.5} width="12" height="12" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} strokeWidth={2.5} width="12" height="12" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} strokeWidth={2.5} width="12" height="12" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps} width="16" height="16" {...props}>
      <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

const TYPE_META: Record<ArtifactType, { label: string; Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactNode }> = {
  code: { label: "Code", Icon: CodeIcon },
  document: { label: "Document", Icon: DocumentIcon },
  web: { label: "Web page", Icon: WebIcon },
  chart: { label: "Chart", Icon: ChartIcon },
  image: { label: "Image", Icon: ImageIcon },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const EXTENSIONS: Record<string, string> = {
  tsx: "tsx", typescript: "ts", jsx: "jsx", javascript: "js",
  html: "html", css: "css", json: "json", python: "py", markdown: "md",
};

/* ------------------------------------------------------------------ */
/* ArtifactPreview                                                     */
/* ------------------------------------------------------------------ */

export function ArtifactPreview({
  title,
  type = "code",
  status = "ready",
  preview,
  code,
  language,
  defaultView = "preview",
  versions,
  currentVersionId,
  onVersionChange,
  errorMessage = "This artifact could not be rendered.",
  staleNote,
  onDownload,
  onFullscreen,
  onOpenExternal,
  onClose,
  className = "",
}: ArtifactPreviewProps) {
  const hasCode = !!code;
  const [view, setView] = React.useState<ArtifactView>(hasCode ? defaultView : "preview");
  const [copied, setCopied] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { label: typeLabel, Icon: TypeIcon } = TYPE_META[type];

  const versionIndex = (() => {
    if (!versions || versions.length === 0) return -1;
    const i = versions.findIndex((v) => v.id === currentVersionId);
    return i >= 0 ? i : versions.length - 1;
  })();

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* Clipboard permission can be denied (iframed embeds, headless). The
         textarea fallback still gets the source onto the clipboard. */
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    if (onDownload) return onDownload();
    if (!code) return;
    const ext = EXTENSIONS[(language ?? "").toLowerCase()] ?? "txt";
    const name = `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "artifact"}.${ext}`;
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function fullscreen() {
    if (onFullscreen) return onFullscreen();
    rootRef.current?.requestFullscreen?.();
  }

  const actionBtn =
    "rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={`Artifact: ${title}`}
      className={`flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {/* Header — wraps instead of squeezing actions off a narrow panel. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          <TypeIcon />
        </span>
        <span className="min-w-0 truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">{typeLabel}</span>

        {status === "streaming" && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            Generating
          </span>
        )}
        {status === "error" && (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-950/60 dark:text-red-400">
            Failed
          </span>
        )}
        {status === "stale" && (
          <span
            title={staleNote}
            className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
          >
            Outdated
          </span>
        )}

        {versions && versions.length > 1 && (
          <span className="flex shrink-0 items-center gap-0.5 text-zinc-400 dark:text-zinc-500">
            <button
              type="button"
              aria-label="Previous version"
              disabled={versionIndex <= 0}
              onClick={() => onVersionChange?.(versions[versionIndex - 1].id)}
              className={`${actionBtn} disabled:opacity-30 disabled:hover:bg-transparent`}
            >
              <ChevronLeftIcon />
            </button>
            <span className="min-w-7 text-center text-[11px] tabular-nums">
              {versions[versionIndex]?.label ?? `v${versionIndex + 1}`}
            </span>
            <button
              type="button"
              aria-label="Next version"
              disabled={versionIndex >= versions.length - 1}
              onClick={() => onVersionChange?.(versions[versionIndex + 1].id)}
              className={`${actionBtn} disabled:opacity-30 disabled:hover:bg-transparent`}
            >
              <ChevronRightIcon />
            </button>
          </span>
        )}

        <span className="flex-1" />

        {hasCode && status !== "error" && (
          <span className="flex shrink-0 items-center rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            {(["preview", "code"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
                  view === v
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {v === "preview" ? <EyeIcon /> : <CodeIcon />}
                {v === "preview" ? "Preview" : "Code"}
              </button>
            ))}
          </span>
        )}

        <span className="flex shrink-0 items-center">
          {hasCode && (
            <button
              type="button"
              aria-label={copied ? "Copied" : "Copy source"}
              onClick={copyCode}
              className={actionBtn}
            >
              {copied ? <CheckIcon className="text-emerald-500" /> : <CopyIcon />}
            </button>
          )}
          {(hasCode || onDownload) && (
            <button type="button" aria-label="Download" onClick={download} className={actionBtn}>
              <DownloadIcon />
            </button>
          )}
          <button type="button" aria-label="Fullscreen" onClick={fullscreen} className={actionBtn}>
            <FullscreenIcon />
          </button>
          {onOpenExternal && (
            <button type="button" aria-label="Open in new window" onClick={onOpenExternal} className={actionBtn}>
              <ExternalIcon />
            </button>
          )}
          {onClose && (
            <button type="button" aria-label="Close artifact" onClick={onClose} className={actionBtn}>
              <XIcon />
            </button>
          )}
        </span>
      </div>

      {/* Streaming progress — indeterminate bar; the panel below never moves. */}
      {status === "streaming" && (
        <div className="h-0.5 overflow-hidden bg-blue-100 dark:bg-blue-950">
          <div className="h-full w-1/3 animate-[artifact-slide_1.2s_ease-in-out_infinite] rounded-full bg-blue-500" />
        </div>
      )}

      {/* Content */}
      <div className="min-h-[240px] bg-zinc-50 dark:bg-zinc-950">
        {status === "error" && view === "preview" ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 px-6 text-center">
            <AlertIcon className="text-red-400" />
            <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{errorMessage}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The conversation is unaffected — ask for a fix, or read the source in the Code view.
            </p>
          </div>
        ) : view === "code" && hasCode ? (
          <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-5 text-zinc-800 dark:text-zinc-200">
            <code>{code}</code>
          </pre>
        ) : preview ? (
          <div className="max-h-[420px] overflow-auto">{preview}</div>
        ) : status === "streaming" ? (
          /* Fixed-shape shimmer: the panel's height is decided before the
             first token lands, so streaming never pushes the layout around. */
          <div className="space-y-3 p-5" aria-label="Artifact is being generated">
            {[85, 60, 75, 40].map((w, i) => (
              <div key={i} className="h-3.5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[240px] items-center justify-center px-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Nothing to preview yet.
          </div>
        )}
      </div>

      {/* Keyframes live in a style tag so the file stays self-contained. */}
      <style>{`@keyframes artifact-slide{0%{transform:translateX(-100%)}100%{transform:translateX(320%)}}`}</style>
    </div>
  );
}
