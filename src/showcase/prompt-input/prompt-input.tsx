"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Attachment = {
  id: string;
  name: string;
  size?: string;
  type?: "image" | "file";
};

export type ModelOption = {
  id: string;
  name: string;
  hint?: string;
  /**
   * Optional leading mark, e.g. the provider's logo. A slot rather than a
   * built-in lookup so this component stays dependency-free — pass whatever
   * icon element you already have.
   */
  icon?: React.ReactNode;
};

export type PromptInputProps = {
  placeholder?: string;
  models?: ModelOption[];
  defaultModel?: string;
  attachments?: Attachment[];
  onAttach?: () => void;
  onRemoveAttachment?: (id: string) => void;
  onVoice?: () => void;
  onSubmit?: (value: string, model?: string) => void;
  onStop?: () => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  showWebSearch?: boolean;
  showTools?: boolean;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons (inline SVG, no dependencies)                                 */
/* ------------------------------------------------------------------ */

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20Z" />
    </svg>
  );
}

function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function MicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
    </svg>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function StopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* PromptInput                                                         */
/* ------------------------------------------------------------------ */

export function PromptInput({
  placeholder = "Ask anything…",
  models,
  defaultModel,
  attachments = [],
  onAttach,
  onRemoveAttachment,
  onVoice,
  onSubmit,
  onStop,
  loading = false,
  disabled = false,
  error = null,
  showWebSearch = true,
  showTools = true,
  className = "",
}: PromptInputProps) {
  const [value, setValue] = React.useState("");
  const [model, setModel] = React.useState(defaultModel ?? models?.[0]?.id);
  const [modelOpen, setModelOpen] = React.useState(false);
  const [webSearch, setWebSearch] = React.useState(false);
  const [tools, setTools] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const activeModel = models?.find((m) => m.id === model);
  const canSubmit = value.trim().length > 0 && !disabled && !loading;

  /* Auto-grow textarea */
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  /* Close model menu on outside click / Escape */
  React.useEffect(() => {
    if (!modelOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModelOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [modelOpen]);

  function submit() {
    if (!canSubmit) return;
    onSubmit?.(value.trim(), activeModel?.id);
    setValue("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const iconButton =
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none";

  const toggleButton = (active: boolean) =>
    `inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40 disabled:pointer-events-none ${
      active
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <div className={`w-full ${className}`}>
      <Card
        className={`gap-0 py-0 w-full rounded-xl border bg-card shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
          error
            ? "border-red-300 dark:border-red-900"
            : "border-border focus-within:border-ring"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {attachments.map((file) => (
              <span
                key={file.id}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted py-1 pl-2 pr-1 text-xs text-foreground"
              >
                {file.type === "image" ? <ImageIcon /> : <FileIcon />}
                <span className="max-w-40 truncate">{file.name}</span>
                {file.size && <span className="text-muted-foreground">{file.size}</span>}
                <Button variant="ghost" size="icon-sm"
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onRemoveAttachment?.(file.id)}
                  className="min-h-6 min-w-6 flex size-6 items-center justify-center rounded text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:bg-muted hover:text-foreground"
                >
                  <XIcon />
                </Button>
              </span>
            ))}
          </div>
        )}

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Prompt"
          aria-invalid={Boolean(error)}
          className="border-0 rounded-none shadow-none focus-visible:ring-0 field-sizing-fixed dark:bg-transparent block w-full resize-none bg-transparent px-4 pt-4 pb-3 text-base sm:text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
        />

        {/* Toolbar */}
        <div className="flex items-end gap-2 px-2.5 pb-2.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            <Button variant="ghost" size="icon-sm"
              type="button"
              onClick={onAttach}
              disabled={disabled}
              aria-label="Add attachment"
              className={iconButton}
            >
              <PlusIcon />
            </Button>

            {showWebSearch && (
              <Button variant="ghost" size="sm"
                type="button"
                onClick={() => setWebSearch((v) => !v)}
                disabled={disabled}
                aria-pressed={webSearch}
                aria-label="Web search"
                className={toggleButton(webSearch)}
              >
                <GlobeIcon />
                <span className="hidden sm:inline">Search</span>
              </Button>
            )}

            {showTools && (
              <Button variant="ghost" size="sm"
                type="button"
                onClick={() => setTools((v) => !v)}
                disabled={disabled}
                aria-pressed={tools}
                aria-label="Tools"
                className={toggleButton(tools)}
              >
                <WrenchIcon />
                <span className="hidden sm:inline">Tools</span>
              </Button>
            )}

            {/* Model selector */}
            {models && models.length > 0 && (
              <div className="relative min-w-0 max-w-full" ref={menuRef}>
                <Button variant="ghost" size="sm"
                  type="button"
                  onClick={() => setModelOpen((v) => !v)}
                  disabled={disabled}
                  aria-haspopup="listbox"
                  aria-expanded={modelOpen}
                  className="inline-flex h-8 max-w-full items-center gap-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                >
                  {activeModel?.icon}
                  <span className="max-w-32 truncate">{activeModel?.name ?? "Model"}</span>
                  <ChevronDownIcon className={modelOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                </Button>
                {modelOpen && (
                  <div
                    role="listbox"
                    className="absolute bottom-full left-0 z-20 mb-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-md"
                  >
                    {models.map((m) => (
                      <Button variant="ghost" size="sm"
                        key={m.id}
                        type="button"
                        role="option"
                        aria-selected={m.id === model}
                        onClick={() => {
                          setModel(m.id);
                          setModelOpen(false);
                          textareaRef.current?.focus();
                        }}
                        className={`h-auto min-h-8 whitespace-normal flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:bg-muted ${
                          m.id === model ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          {m.icon}
                          <span className="truncate">{m.name}</span>
                        </span>
                        {m.hint && <span className="shrink-0 text-xs text-muted-foreground">{m.hint}</span>}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon-sm"
              type="button"
              onClick={onVoice}
              disabled={disabled}
              aria-label="Voice input"
              className={iconButton}
            >
              <MicIcon />
            </Button>

            {loading ? (
              <Button variant="default" size="icon-sm"
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                className="min-h-6 min-w-6 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:opacity-80"
              >
                <StopIcon />
              </Button>
            ) : (
              <Button variant="default" size="icon-sm"
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                aria-label="Send message"
                className="min-h-6 min-w-6 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:opacity-80 disabled:opacity-30"
              >
                <ArrowUpIcon />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 px-1 text-xs text-red-600 dark:text-red-400">
          <AlertIcon />
          {error}
        </p>
      )}
    </div>
  );
}
