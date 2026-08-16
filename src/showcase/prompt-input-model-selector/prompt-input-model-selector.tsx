"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ModelOption = {
  id: string;
  name: string;
  description?: string;
  badges?: string[];
};

export type PromptInputModelSelectorProps = {
  models: ModelOption[];
  defaultModel?: string;
  placeholder?: string;
  disabled?: boolean;
  onSubmit?: (value: string, modelId: string) => void;
  onChange?: (modelId: string) => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="m6 9 6 6 6-6" />
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

function SparkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M6 7l-1-1M18 17l1 1M12 8l1.5 3.5L17 13l-3.5 1.5L12 18l-1.5-3.5L7 13l3.5-1.5Z" />
    </svg>
  );
}

function BoltIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* PromptInputModelSelector                                            */
/* ------------------------------------------------------------------ */

export function PromptInputModelSelector({
  models,
  defaultModel,
  placeholder = "Ask anything…",
  disabled = false,
  onSubmit,
  onChange,
  className = "",
}: PromptInputModelSelectorProps) {
  const [value, setValue] = React.useState("");
  const [modelId, setModelId] = React.useState(defaultModel ?? models[0]?.id ?? "");
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const active = models.find((m) => m.id === modelId);
  const canSubmit = value.trim().length > 0 && !disabled;

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  React.useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function selectModel(id: string) {
    if (id === modelId) return;
    setModelId(id);
    onChange?.(id);
    setOpen(false);
    textareaRef.current?.focus();
  }

  function submit() {
    if (!canSubmit) return;
    onSubmit?.(value.trim(), modelId);
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
        {/* Model bar */}
        <div className="flex items-center gap-2 border-b border-zinc-100 px-2.5 pt-2 pb-2 dark:border-zinc-800">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <SparkIcon className="text-zinc-400" />
              {active?.name ?? "Select model"}
              <ChevronDownIcon className={open ? "rotate-180 transition-transform text-zinc-400" : "text-zinc-400 transition-transform"} />
            </button>

            {open && (
              <div
                role="listbox"
                className="absolute left-0 top-full z-20 mt-1.5 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
              >
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={m.id === modelId}
                    onClick={() => selectModel(m.id)}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                      m.id === modelId ? "bg-zinc-50 dark:bg-zinc-700/60" : ""
                    }`}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-zinc-400">
                      {m.id === modelId ? <CheckIcon className="text-emerald-500" /> : <BoltIcon />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {m.name}
                        {m.badges?.map((b) => (
                          <span
                            key={b}
                            className="rounded bg-zinc-100 px-1 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300"
                          >
                            {b}
                          </span>
                        ))}
                      </span>
                      {m.description && (
                        <span className="mt-0.5 block text-xs leading-4 text-zinc-500 dark:text-zinc-400">
                          {m.description}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {active?.description && (
            <span className="hidden truncate text-xs text-zinc-400 sm:block">{active.description}</span>
          )}
        </div>

        {/* Input */}
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
          className="block w-full resize-none bg-transparent px-4 pt-3 pb-1.5 text-[15px] leading-6 text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />

        <div className="flex items-center justify-end px-2.5 pb-2.5">
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
