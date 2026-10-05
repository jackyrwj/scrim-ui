"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
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
          : "border-border bg-muted text-foreground"
      }`}
    >
      {file.type === "image" ? <ImageIcon /> : <FileIcon />}
      <span className="max-w-36 truncate">{file.name}</span>
      {}
      {file.size && <span className="text-muted-foreground">{file.size}</span>}

      {status === "uploading" && file.progress !== undefined && (
        <>
          <span className="h-1 w-10 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary transition-[color,background-color,border-color,box-shadow]"
              style={{ width: `${file.progress}%` }}
            />
          </span>
          <span className="tabular-nums text-muted-foreground">{file.progress}%</span>
        </>
      )}

      {status === "error" ? (
        <>
          <AlertIcon />
          {onRetry && (
            <Button variant="ghost" size="sm"
              type="button"
              onClick={() => onRetry(file.id)}
              className="rounded px-1.5 py-0.5 font-medium text-red-700 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40"
            >
              Retry
            </Button>
          )}
        </>
      ) : (
        onRemove && (
          <Button variant="ghost" size="icon-sm"
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={() => onRemove(file.id)}
            className="min-h-6 min-w-6 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon />
          </Button>
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
      <Card
        className={`gap-0 py-0 rounded-xl border bg-card shadow-sm transition-colors ${
          disabled
            ? "border-border opacity-60"
            : "border-border focus-within:border-border"
        }`}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {files.map((f) => (
              <FileChip key={f.id} file={f} onRemove={onRemove} onRetry={onRetry} />
            ))}
          </div>
        )}

        <Textarea
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
          className="border-0 rounded-none shadow-none focus-visible:ring-0 field-sizing-fixed dark:bg-transparent block w-full resize-none bg-transparent px-4 pt-3.5 pb-1.5 text-base sm:text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center justify-between px-2.5 pb-2.5">
          <Button variant="ghost" size="icon-sm"
            type="button"
            onClick={onAttach}
            disabled={disabled}
            aria-label="Add attachment"
            className="min-h-6 min-w-6 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <PlusIcon />
          </Button>
          <span className="text-xs text-muted-foreground">Enter to send · Shift+Enter for newline</span>
          <Button variant="default" size="icon-sm"
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            aria-label="Send message"
            className="min-h-6 min-w-6 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-30"
          >
            <ArrowUpIcon />
          </Button>
        </div>
      </Card>
    </div>
  );
}
