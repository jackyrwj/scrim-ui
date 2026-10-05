"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ModelOption = {
  id: string;
  name: string;
  description?: string;
  badges?: string[];
  /**
   * Optional leading mark, e.g. the provider's logo. A slot rather than a
   * built-in lookup so this component stays dependency-free — pass whatever
   * icon element you already have.
   */
  icon?: React.ReactNode;
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SparkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M6 7l-1-1M18 17l1 1M12 8l1.5 3.5L17 13l-3.5 1.5L12 18l-1.5-3.5L7 13l3.5-1.5Z" />
    </svg>
  );
}

function BoltIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
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
      {/* axe reports the dimmed model hint here as a 2.34:1 contrast failure.
          Leave it. WCAG 2.1 SC 1.4.3 exempts "text that is part of an inactive
          user interface component" from the contrast minimum, and axe cannot
          see that this subtree is disabled. Darkening it would make the
          disabled state read as enabled — a real regression in service of a
          misapplied rule. */}
      <Card
        className={`gap-0 py-0 rounded-xl border bg-card shadow-sm transition-colors ${
          disabled
            ? "border-border opacity-60"
            : "border-border focus-within:border-border"
        }`}
      >
        {/* Model bar */}
        <div className="flex items-center gap-2 border-b border-border px-2.5 pt-2 pb-2">
          <div className="relative" ref={menuRef}>
            <Button variant="ghost" size="sm"
              type="button"
              onClick={() => setOpen((v) => !v)}
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-muted px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <SparkIcon className="text-muted-foreground" />
              {active?.icon}
              {active?.name ?? "Select model"}
              <ChevronDownIcon className={open ? "rotate-180 transition-transform text-muted-foreground" : "text-muted-foreground transition-transform"} />
            </Button>

            {open && (
              <div
                role="listbox"
                className="absolute left-0 top-full z-20 mt-1.5 w-72 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-md"
              >
                {models.map((m) => (
                  <Button variant="ghost" size="sm"
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={m.id === modelId}
                    onClick={() => selectModel(m.id)}
                    className={`h-auto min-h-8 whitespace-normal justify-start flex w-full items-start gap-2.5 rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-muted ${
                      m.id === modelId ? "bg-muted" : ""
                    }`}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
                      {m.id === modelId ? <CheckIcon className="text-emerald-500" /> : <BoltIcon />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        {m.icon}
                        {m.name}
                        {m.badges?.map((b) => (
                          <span
                            key={b}
                            className="rounded bg-muted px-1 py-0.5 text-xs font-medium text-muted-foreground"
                          >
                            {b}
                          </span>
                        ))}
                      </span>
                      {m.description && (
                        <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                          {m.description}
                        </span>
                      )}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {active?.description && (
            <span className="hidden truncate text-xs text-muted-foreground sm:block">{active.description}</span>
          )}
        </div>

        {/* Input */}
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
          className="border-0 rounded-none shadow-none focus-visible:ring-0 field-sizing-fixed dark:bg-transparent block w-full resize-none bg-transparent px-4 pt-3 pb-1.5 text-base sm:text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center justify-end px-2.5 pb-2.5">
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
