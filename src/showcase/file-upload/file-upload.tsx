"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type FileUploadStatus = "idle" | "uploading" | "done" | "error";

export type FileUploadProps = {
  status?: FileUploadStatus;
  progress?: number;
  fileName?: string;
  fileSize?: string;
  accept?: string;
  onSelect?: (files: FileList | null) => void;
  onRetry?: () => void;
  onRemove?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5M12 3v12" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* FileUpload                                                          */
/* ------------------------------------------------------------------ */

export function FileUpload({
  status = "idle",
  progress = 0,
  fileName,
  fileSize,
  accept,
  onSelect,
  onRetry,
  onRemove,
  className = "",
}: FileUploadProps) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (files && files.length > 0) onSelect?.(files);
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {status === "idle" ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
            dragging
              ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
              : "border-zinc-300 bg-zinc-50/60 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
          }`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <UploadIcon />
          </span>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Drag &amp; drop files here
          </span>
          <span className="text-xs text-zinc-400">or click to browse</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              status === "error"
                ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {status === "done" ? <CheckIcon /> : status === "error" ? <AlertIcon /> : <FileIcon />}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {fileName ?? "document.pdf"}
              </span>
              {fileSize && <span className="shrink-0 text-xs text-zinc-400">{fileSize}</span>}
            </div>

            {status === "uploading" && (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
            {status === "error" && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Upload failed — try again
              </p>
            )}
            {status === "done" && (
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Ready to use in context
              </p>
            )}
          </div>

          {status === "uploading" && (
            <span className="shrink-0 text-xs tabular-nums text-zinc-400">{progress}%</span>
          )}
          {status === "error" && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Retry
            </button>
          )}
          {(status === "done" || status === "error") && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove file"
              className="shrink-0 rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <XIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
