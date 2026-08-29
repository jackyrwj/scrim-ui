"use client";

import * as React from "react";
import { CopyButton } from "@/components/component-page/copy-button";
import { Section, inputCls } from "../tool-ui";
import { combineSections, type SectionType } from "./sections";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface PromptSection {
  id: string;
  type: SectionType;
  content: string;
  collapsed: boolean;
}

const SECTION_TYPES: SectionType[] = [
  "Role",
  "Rules",
  "Output Format",
  "Constraints",
  "Context",
  "Examples",
  "Tone",
  "Error Handling",
];

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_SECTIONS: PromptSection[] = [
  {
    id: makeId(),
    type: "Role",
    content:
      "You are a senior frontend engineer specializing in React and TypeScript. You write clean, well-tested code following modern best practices.",
    collapsed: false,
  },
  {
    id: makeId(),
    type: "Rules",
    content:
      "- Always use TypeScript with strict mode\n- Prefer functional components with hooks\n- Write unit tests for all utility functions\n- Use descriptive variable names",
    collapsed: false,
  },
  {
    id: makeId(),
    type: "Output Format",
    content:
      "Respond with:\n1. A brief explanation of your approach\n2. The complete code\n3. Example usage",
    collapsed: false,
  },
  {
    id: makeId(),
    type: "Constraints",
    content:
      "- Never use any external dependencies without asking first\n- Keep responses concise — no unnecessary explanations\n- If the request is ambiguous, ask clarifying questions before coding",
    collapsed: false,
  },
];

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function GripIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-90" : ""} ${className ?? ""}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function SystemPromptBuilder() {
  const [sections, setSections] = React.useState<PromptSection[]>(() =>
    structuredClone(DEFAULT_SECTIONS),
  );
  const [addType, setAddType] = React.useState<SectionType>("Context");

  /* ---- derived ---- */
  const combinedPrompt = combineSections(sections);

  const charCount = combinedPrompt.length;
  const tokenEstimate = Math.ceil(charCount / 4);

  /* ---- handlers ---- */
  function updateContent(id: string, content: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, content } : s)));
  }

  function toggleCollapsed(id: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, collapsed: !s.collapsed } : s)));
  }

  function deleteSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function addSection() {
    setSections((prev) => [
      ...prev,
      { id: makeId(), type: addType, content: "", collapsed: false },
    ]);
  }

  function reset() {
    setSections(structuredClone(DEFAULT_SECTIONS));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            System Prompt Builder
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-(--muted-foreground)">
            Build structured system prompts from modular blocks. Define each section, reorder, and
            copy the final prompt.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-8 items-center rounded-lg border border-(--border) px-4 text-sm font-medium transition-colors hover:bg-(--muted)"
          >
            Reset
          </button>
          <CopyButton code={combinedPrompt} label="Copy Prompt" disabled={!combinedPrompt} />
        </div>
      </div>

      {/* Editor + preview */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[380px_1fr]">
        {/* Left panel — section editor */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-(--border) bg-(--card) p-4"
            >
              {/* Section header */}
              <div className="flex items-center gap-2">
                <GripIcon className="shrink-0 cursor-grab text-(--muted-foreground)" />
                <button
                  type="button"
                  onClick={() => toggleCollapsed(section.id)}
                  className="flex items-center gap-1.5"
                >
                  <ChevronIcon open={!section.collapsed} />
                </button>
                <span className="inline-flex items-center rounded-md bg-(--muted) px-2 py-0.5 text-xs font-medium text-(--foreground)">
                  {section.type}
                </span>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => deleteSection(section.id)}
                  className="rounded-md p-1 text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground)"
                  aria-label={`Delete ${section.type} section`}
                >
                  <TrashIcon />
                </button>
              </div>

              {/* Section body */}
              {!section.collapsed && (
                <div className="mt-3">
                  <textarea
                    value={section.content}
                    onChange={(e) => updateContent(section.id, e.target.value)}
                    rows={4}
                    placeholder={`Enter ${section.type.toLowerCase()} content...`}
                    className={`${inputCls} resize-y font-mono text-xs leading-5`}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add section */}
          <div className="flex items-center gap-2">
            <select
              value={addType}
              onChange={(e) => setAddType(e.target.value as SectionType)}
              className="h-8 appearance-none rounded-lg border border-(--border) bg-(--background) px-3 text-xs outline-none transition-colors focus:border-(--foreground)"
            >
              {SECTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addSection}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-(--border) px-3 text-xs font-medium transition-colors hover:bg-(--muted)"
            >
              <PlusIcon />
              Add Section
            </button>
          </div>
        </div>

        {/* Right panel — preview */}
        <div className="lg:sticky lg:top-20">
          <Section title="Preview">
            {combinedPrompt ? (
              <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-(--foreground)">
                {combinedPrompt}
              </pre>
            ) : (
              <p className="rounded-lg border border-dashed border-(--border) bg-(--muted)/30 px-4 py-8 text-center text-sm text-(--muted-foreground)">
                Add content to your sections to see a preview.
              </p>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-(--border) pt-3 text-xs text-(--muted-foreground)">
              <span>{charCount.toLocaleString()} characters</span>
              <span>~{tokenEstimate.toLocaleString()} tokens</span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
