"use client";

import * as React from "react";
import { CodeCopyButton } from "./code-copy-button";

/**
 * A generated agent prompt, presented as a module of its own.
 *
 * Component pages used to carry theirs as a third tab beside Preview and
 * Usage inside the Explorer; now the Explorer renders this card directly
 * under the install command, above the interactive surface (it still has to
 * be inside the Explorer, because the prompt follows the control values,
 * and a separate island could not see them). Patterns and icons have no
 * Explorer at all, so for them this card is the only surface.
 *
 * A disclosure, collapsed by default, since a reader who wants the file
 * itself should not have to scroll past forty lines of instructions
 * addressed to a machine.
 *
 * Open, rather than a bare "Copy prompt" button, because a reader is about to
 * hand this to an agent with write access to their repo. They should be able
 * to read what it says first.
 */
export function AgentPromptCard({
  prompt,
  summary = "Agent prompt",
  hint,
}: {
  prompt: string;
  summary?: string;
  hint?: string;
}) {
  return (
    <details className="group overflow-hidden rounded-xl border border-(--border)">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-(--muted)/60">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-(--muted-foreground) transition-transform group-open:rotate-90"
          aria-hidden
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        {summary}
        <span className="ml-auto text-xs font-normal text-(--muted-foreground)">
          Claude Code · Cursor · any agent
        </span>
      </summary>
      <div
        className="relative border-t border-(--border)"
        style={{ background: "var(--code-bg)", color: "var(--code-fg)" }}
      >
        <div className="absolute right-2 top-2 z-10">
          <CodeCopyButton code={prompt} label="Copy agent prompt" />
        </div>
        <pre
          className="max-h-[420px] overflow-auto px-4 py-3.5 text-[12.5px] leading-6"
          style={{ background: "var(--code-bg)" }}
        >
          <code className="whitespace-pre-wrap font-mono">{prompt}</code>
        </pre>
        {hint && <p className="px-4 pb-3.5 text-[11px] text-(--tok-comment)">{hint}</p>}
      </div>
    </details>
  );
}
