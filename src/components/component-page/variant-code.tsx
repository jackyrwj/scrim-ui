"use client";

import * as React from "react";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";

/**
 * The source for one variant, collapsed by default.
 *
 * Collapsed because the variants section is meant to be scanned — nine
 * components have four or more variants, and four expanded code blocks
 * between the previews would push the next variant off the screen. The copy
 * button sits outside the disclosure, so taking the code never costs a click.
 */
export function VariantCode({ code, lang }: { code: string; lang: string }) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground)"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={`transition-transform ${open ? "rotate-90" : ""}`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          {open ? "Hide code" : "Show code"}
        </button>
        <CopyButton code={code} label="Copy variant" />
      </div>
      {open && (
        <div id={id} className="mt-3">
          <CodeBlock code={code} lang={lang} />
        </div>
      )}
    </div>
  );
}
