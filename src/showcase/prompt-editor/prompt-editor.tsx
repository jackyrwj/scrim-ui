"use client";

import * as React from "react";

/**
 * A prompt template editor: {{variables}} highlighted as you type, a rendered
 * preview, and a line diff against a previous version.
 *
 * The highlighting is a transparent textarea over a highlighted <pre>. The
 * trick is well known; the traps are in keeping the two layers pixel-identical:
 *
 *  1. ANY TYPOGRAPHIC DRIFT DESYNCS THE LAYERS. Font, size, line height,
 *     padding and wrapping must match exactly — a textarea's default font is
 *     not the pre's, so both get the same classes, and the shared values live
 *     in one constant so they cannot drift apart in two places.
 *  2. THE TEXTAREA SCROLLS, THE PRE DOES NOT. Without scroll sync the
 *     highlights stay behind while the text moves. The pre's scrollTop is
 *     mirrored from the textarea's onScroll — an event handler, so touching
 *     the ref there is safe.
 *  3. A TRAILING NEWLINE COLLAPSES IN THE PRE BUT NOT THE TEXTAREA. The pre
 *     renders one line short and the caret appears to float. A zero-width
 *     space is appended to the mirror text so both layers keep the last line.
 *  4. UNRESOLVED VARIABLES MUST LOOK DIFFERENT FROM KNOWN ONES. A typo in a
 *     {{name}} is silent in plain text and loud in preview. Known variables
 *     get one tint, anything else matching {{...}} gets a warning tint, and
 *     `renderTemplate` leaves unknown names untouched rather than blanking
 *     them — "{{naem}}" in the output beats an empty hole.
 */

/* ------------------------------------------------------------------ */
/* Template rendering                                                  */
/* ------------------------------------------------------------------ */

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

/** The variable names a template references, in order of first appearance. */
export function templateVariables(template: string): string[] {
  const names: string[] = [];
  for (const match of template.matchAll(VARIABLE_PATTERN)) {
    if (!names.includes(match[1])) names.push(match[1]);
  }
  return names;
}

/**
 * Substitute {{name}} from `values`. A name with no value is left as-is —
 * "{{naem}}" in the output is a visible mistake; an empty string where a name
 * should be is an invisible one.
 */
export function renderTemplate(template: string, values: Record<string, string>): string {
  return template.replace(VARIABLE_PATTERN, (raw, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? values[name] : raw,
  );
}

/* ------------------------------------------------------------------ */
/* Line diff (for compareWith)                                         */
/* ------------------------------------------------------------------ */

type DiffLine = { text: string; side: "same" | "removed" | "added" };

/** LCS over lines. Prompts are short; the quadratic table is never felt. */
function diffLines(before: string, after: string): DiffLine[] {
  const a = before.replace(/\n$/, "").split("\n");
  const b = after.replace(/\n$/, "").split("\n");

  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      lines.push({ text: a[i], side: "same" });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      lines.push({ text: a[i++], side: "removed" });
    } else {
      lines.push({ text: b[j++], side: "added" });
    }
  }
  while (i < a.length) lines.push({ text: a[i++], side: "removed" });
  while (j < b.length) lines.push({ text: b[j++], side: "added" });
  return lines;
}

/* ------------------------------------------------------------------ */
/* Highlight layer                                                     */
/* ------------------------------------------------------------------ */

type Token = { text: string; variable: string | null; known: boolean };

function tokenize(template: string, known: string[] | undefined): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of template.matchAll(VARIABLE_PATTERN)) {
    if (match.index > last) tokens.push({ text: template.slice(last, match.index), variable: null, known: false });
    tokens.push({
      text: match[0],
      variable: match[1],
      known: known === undefined || known.includes(match[1]),
    });
    last = match.index + match[0].length;
  }
  if (last < template.length) tokens.push({ text: template.slice(last), variable: null, known: false });
  return tokens;
}

/* Shared by both layers — the whole trick fails if these drift. */
const LAYER_CLASSES =
  "m-0 whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-6";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export type PromptEditorProps = {
  value: string;
  onChange: (value: string) => void;
  /** Known variable names. Any {{other}} gets a warning tint. Omit to accept everything. */
  variables?: string[];
  placeholder?: string;
  rows?: number;
  /** Sample values. When provided, a Write / Preview toggle appears. */
  previewValues?: Record<string, string>;
  /** A previous version of the template; renders a line diff below the editor. */
  compareWith?: string;
  className?: string;
};

export function PromptEditor({
  value,
  onChange,
  variables,
  placeholder = "Write the prompt… {{variables}} are highlighted as you type.",
  rows = 8,
  previewValues,
  compareWith,
  className = "",
}: PromptEditorProps) {
  const [tab, setTab] = React.useState<"write" | "preview">("write");
  const mirrorRef = React.useRef<HTMLPreElement>(null);

  const tokens = tokenize(value, variables);
  const used = templateVariables(value);
  const unknown = variables ? used.filter((n) => !variables.includes(n)) : [];

  const diff = React.useMemo(
    () => (compareWith !== undefined && compareWith !== value ? diffLines(compareWith, value) : null),
    [compareWith, value],
  );

  return (
    <div className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {previewValues !== undefined && (
        <div className="flex items-center gap-1 border-b border-zinc-100 px-2 py-1.5 dark:border-zinc-800">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`h-7 rounded-lg px-2.5 text-[12px] font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">
            {used.length} {used.length === 1 ? "variable" : "variables"} · {value.length} chars
          </span>
        </div>
      )}

      {tab === "preview" && previewValues !== undefined ? (
        <div
          className={`${LAYER_CLASSES} text-zinc-800 dark:text-zinc-200`}
          style={{ minHeight: `${rows * 1.5 + 1.6}rem` }}
        >
          {renderTemplate(value, previewValues) || <span className="text-zinc-400 dark:text-zinc-500">Nothing to preview.</span>}
        </div>
      ) : (
        <div className="relative">
          {/* Highlight mirror. aria-hidden: the textarea carries the text. */}
          <pre ref={mirrorRef} aria-hidden className={`${LAYER_CLASSES} pointer-events-none absolute inset-0 overflow-hidden text-zinc-800 dark:text-zinc-200`}>
            {tokens.map((token, i) =>
              token.variable === null ? (
                <React.Fragment key={i}>{token.text}</React.Fragment>
              ) : (
                <span
                  key={i}
                  className={
                    token.known
                      ? "rounded-[3px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                      : "rounded-[3px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                  }
                >
                  {token.text}
                </span>
              ),
            )}
            {/* A trailing newline collapses in the pre but not the textarea —
                the zero-width space keeps the last line in both layers. */}
            {"\u200B"}
          </pre>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={(e) => {
              const mirror = mirrorRef.current;
              if (mirror) {
                mirror.scrollTop = e.currentTarget.scrollTop;
                mirror.scrollLeft = e.currentTarget.scrollLeft;
              }
            }}
            placeholder={placeholder}
            rows={rows}
            spellCheck={false}
            className={`${LAYER_CLASSES} relative block w-full resize-y bg-transparent text-transparent caret-zinc-900 outline-none placeholder:text-zinc-400 dark:caret-zinc-100 dark:placeholder:text-zinc-500`}
          />
        </div>
      )}

      {unknown.length > 0 && tab === "write" && (
        <p className="border-t border-amber-100 bg-amber-50 px-3 py-1.5 text-[12px] text-amber-800 dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-300">
          {unknown.length === 1 ? "Unknown variable" : "Unknown variables"}: {unknown.map((n) => `{{${n}}}`).join(", ")} — not in the variables list, left as-is in preview.
        </p>
      )}

      {diff !== null && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <p className="px-3 pt-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Against the previous version
          </p>
          <div className="py-1.5 font-mono text-[12px] leading-5">
            {diff.map((line, i) =>
              line.side === "same" ? (
                <div key={i} className="truncate px-3 text-zinc-400 dark:text-zinc-500">
                  {"  "}
                  {line.text}
                </div>
              ) : (
                <div
                  key={i}
                  className={`truncate px-3 ${
                    line.side === "removed"
                      ? "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                      : "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                  }`}
                >
                  {line.side === "removed" ? "− " : "+ "}
                  {line.text}
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
