"use client";

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20Z" />
    </svg>
  );
}

function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function MicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
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

function StopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="m6 9 6 6 6-6" />
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

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
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
    "inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

  const toggleButton = (active: boolean) =>
    `inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${
      active
        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    }`;

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`w-full rounded-2xl border bg-white shadow-sm transition-colors dark:bg-zinc-900 ${
          error
            ? "border-red-300 dark:border-red-900"
            : "border-zinc-200 focus-within:border-zinc-400 dark:border-zinc-800 dark:focus-within:border-zinc-600"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {attachments.map((file) => (
              <span
                key={file.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 py-1 pl-2 pr-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300"
              >
                {file.type === "image" ? <ImageIcon /> : <FileIcon />}
                <span className="max-w-40 truncate">{file.name}</span>
                {file.size && <span className="text-zinc-400">{file.size}</span>}
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onRemoveAttachment?.(file.id)}
                  className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                >
                  <XIcon />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Prompt"
          className="block w-full resize-none bg-transparent px-4 pt-3.5 pb-1.5 text-[15px] leading-6 text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2.5 pb-2.5">
          <button
            type="button"
            onClick={onAttach}
            disabled={disabled}
            aria-label="Add attachment"
            className={iconButton}
          >
            <PlusIcon />
          </button>

          {showWebSearch && (
            <button
              type="button"
              onClick={() => setWebSearch((v) => !v)}
              disabled={disabled}
              aria-pressed={webSearch}
              aria-label="Web search"
              className={toggleButton(webSearch)}
            >
              <GlobeIcon />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}

          {showTools && (
            <button
              type="button"
              onClick={() => setTools((v) => !v)}
              disabled={disabled}
              aria-pressed={tools}
              aria-label="Tools"
              className={toggleButton(tools)}
            >
              <WrenchIcon />
              <span className="hidden sm:inline">Tools</span>
            </button>
          )}

          {/* Model selector */}
          {models && models.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setModelOpen((v) => !v)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={modelOpen}
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                {activeModel?.name ?? "Model"}
                <ChevronDownIcon className={modelOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              {modelOpen && (
                <div
                  role="listbox"
                  className="absolute bottom-full left-0 z-20 mb-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      role="option"
                      aria-selected={m.id === model}
                      onClick={() => {
                        setModel(m.id);
                        setModelOpen(false);
                        textareaRef.current?.focus();
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                        m.id === model ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <span>{m.name}</span>
                      {m.hint && <span className="text-xs text-zinc-400">{m.hint}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={onVoice}
            disabled={disabled}
            aria-label="Voice input"
            className={iconButton}
          >
            <MicIcon />
          </button>

          {loading ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white transition-opacity hover:opacity-80 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <StopIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              aria-label="Send message"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white transition-opacity hover:opacity-80 disabled:opacity-30 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <ArrowUpIcon />
            </button>
          )}
        </div>
      </div>

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
