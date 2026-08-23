"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type PendingFile = {
  id: string;
  name: string;
  size?: string;
  type?: "image" | "file";
  status?: "uploading" | "done" | "error";
  progress?: number;
};

export type PromptInputAttachmentsProps = {
  files?: PendingFile[];
  placeholder?: string;
  disabled?: boolean;
  onSubmit?: (value: string) => void;
  onAttach?: () => void;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* File chip                                                           */
/* ------------------------------------------------------------------ */

function FileChip({
  file,
  onRemove,
  onRetry,
}: {
  file: PendingFile;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
}) {
  const status = file.status ?? "done";
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border py-1 pl-2 pr-1 text-xs ${
        status === "error"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300"
      }`}
    >
      {file.type === "image" ? <ImageIcon /> : <FileIcon />}
      <span className="max-w-36 truncate">{file.name}</span>
      {file.size && <span className="text-zinc-500 dark:text-zinc-400">{file.size}</span>}

      {status === "uploading" && file.progress !== undefined && (
        <>
          <span className="h-1 w-10 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <span
              className="block h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${file.progress}%` }}
            />
          </span>
          <span className="tabular-nums text-zinc-500 dark:text-zinc-400">{file.progress}%</span>
        </>
      )}

      {status === "error" ? (
        <>
          <AlertIcon />
          {onRetry && (
            <button
              type="button"
              onClick={() => onRetry(file.id)}
              className="rounded px-1.5 py-0.5 font-medium text-red-600 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40"
            >
              Retry
            </button>
          )}
        </>
      ) : (
        onRemove && (
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={() => onRemove(file.id)}
            className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <XIcon />
          </button>
        )
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* PromptInputAttachments                                              */
/* ------------------------------------------------------------------ */

export function PromptInputAttachments({
  files = [],
  placeholder = "Ask anything…",
  disabled = false,
  onSubmit,
  onAttach,
  onRemove,
  onRetry,
  className = "",
}: PromptInputAttachmentsProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const canSubmit = value.trim().length > 0 && !disabled;

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function submit() {
    if (!canSubmit) return;
    onSubmit?.(value.trim());
    setValue("");
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`rounded-2xl border bg-white shadow-sm transition-colors dark:bg-zinc-900 ${
          disabled
            ? "border-zinc-200 opacity-60 dark:border-zinc-800"
            : "border-zinc-200 focus-within:border-zinc-400 dark:border-zinc-800 dark:focus-within:border-zinc-600"
        }`}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {files.map((f) => (
              <FileChip key={f.id} file={f} onRemove={onRemove} onRetry={onRetry} />
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Prompt"
          className="block w-full resize-none bg-transparent px-4 pt-3.5 pb-1.5 text-[15px] leading-6 text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />

        <div className="flex items-center justify-between px-2.5 pb-2.5">
          <button
            type="button"
            onClick={onAttach}
            disabled={disabled}
            aria-label="Add attachment"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <PlusIcon />
          </button>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Enter to send · Shift+Enter for newline</span>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            aria-label="Send message"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white transition-opacity hover:opacity-80 disabled:opacity-30 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <ArrowUpIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
