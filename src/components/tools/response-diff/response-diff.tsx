"use client";

import * as React from "react";
import { Section, inputCls } from "../tool-ui";
import { countWords, estimateTokens } from "./stats";

/* ------------------------------------------------------------------ */
/* Sample responses                                                    */
/* ------------------------------------------------------------------ */

const SAMPLE_A = `Here's a concise debounce implementation in TypeScript:

\`\`\`typescript
const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
\`\`\`

Usage:
\`\`\`typescript
const handleSearch = debounce((query: string) => {
  fetchResults(query);
}, 300);
\`\`\`

The arrow function captures \`timer\` in a closure. Each call clears the previous timeout and sets a new one, so the wrapped function only fires after the caller stops invoking it for \`delay\` ms.`;

const SAMPLE_B = `To implement a debounce function in TypeScript, you need to delay the execution of a function until a certain amount of time has passed since the last invocation. Here's how to do it:

\`\`\`typescript
function debounce<T extends (...args: any[]) => void>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debouncedFn(...args: Parameters<T>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, waitMs);
  };
}
\`\`\`

**How it works:**
1. A \`timeoutId\` variable tracks the pending timer.
2. Each time the returned function is called, any existing timer is cleared.
3. A new timer is set that will invoke the original function after \`waitMs\` milliseconds of inactivity.
4. After execution, the \`timeoutId\` is reset to \`null\`.

**Example usage:**
\`\`\`typescript
const debouncedSearch = debounce((query: string) => {
  console.log("Searching for:", query);
  fetchResults(query);
}, 300);

inputElement.addEventListener("input", (e) => {
  debouncedSearch((e.target as HTMLInputElement).value);
});
\`\`\`

This pattern is especially useful for search inputs, window resize handlers, and scroll events where you want to avoid excessive function calls.`;

const MODEL_OPTIONS = [
  "Claude Sonnet 4",
  "Claude Opus 4",
  "Claude Haiku 3.5",
  "GPT-4.1",
  "GPT-4.1 mini",
  "GPT-4o",
  "Gemini 2.5 Pro",
  "Gemini 2.5 Flash",
  "DeepSeek V3",
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function ResponseDiff() {
  const [textA, setTextA] = React.useState(SAMPLE_A);
  const [textB, setTextB] = React.useState(SAMPLE_B);
  const [modelA, setModelA] = React.useState("Claude Sonnet 4");
  const [modelB, setModelB] = React.useState("GPT-4.1");

  const statsA = React.useMemo(
    () => ({
      chars: textA.length,
      words: countWords(textA),
      tokens: estimateTokens(textA),
    }),
    [textA],
  );

  const statsB = React.useMemo(
    () => ({
      chars: textB.length,
      words: countWords(textB),
      tokens: estimateTokens(textB),
    }),
    [textB],
  );

  const maxChars = Math.max(statsA.chars, statsB.chars, 1);

  function handleSwap() {
    setTextA(textB);
    setTextB(textA);
    setModelA(modelB);
    setModelB(modelA);
  }

  function handleClear() {
    setTextA("");
    setTextB("");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Response Diff</h1>
          <p className="mt-1 max-w-xl text-sm text-(--muted-foreground)">
            Compare two AI responses side by side. Highlight differences to evaluate prompt changes
            or compare models.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 3l4 4-4 4" />
              <path d="M20 7H4" />
              <path d="M8 21l-4-4 4-4" />
              <path d="M4 17h16" />
            </svg>
            Swap
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Model selectors */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <span className="mb-1.5 block text-xs font-medium text-(--muted-foreground)">
            Model A
          </span>
          <select
            value={modelA}
            onChange={(e) => setModelA(e.target.value)}
            className={`${inputCls} appearance-none`}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-medium text-(--muted-foreground)">
            Model B
          </span>
          <select
            value={modelB}
            onChange={(e) => setModelB(e.target.value)}
            className={`${inputCls} appearance-none`}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Response textareas */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Section title="Response A">
          <textarea
            rows={12}
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste response A here..."
            className={`${inputCls} min-h-[12rem] resize-y font-mono text-xs leading-relaxed`}
          />
        </Section>
        <Section title="Response B">
          <textarea
            rows={12}
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Paste response B here..."
            className={`${inputCls} min-h-[12rem] resize-y font-mono text-xs leading-relaxed`}
          />
        </Section>
      </div>

      {/* Stats comparison */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatsBar label="A" stats={statsA} maxChars={maxChars} color="bg-blue-500" />
        <StatsBar label="B" stats={statsB} maxChars={maxChars} color="bg-amber-500" />
      </div>

      {/* Analysis */}
      <div className="mt-4">
        <Section title="Analysis">
          <ul className="space-y-2 text-sm text-(--muted-foreground)">
            <AnalysisBullet>
              Response A is{" "}
              <span className="font-medium text-(--foreground)">
                {Math.abs(
                  Math.round(((statsA.chars - statsB.chars) / Math.max(statsB.chars, 1)) * 100),
                )}
                % {statsA.chars < statsB.chars ? "shorter" : "longer"}
              </span>{" "}
              than Response B
            </AnalysisBullet>
            <AnalysisBullet>Both responses include code examples</AnalysisBullet>
            <AnalysisBullet>
              Response A uses arrow function, Response B uses named function
            </AnalysisBullet>
          </ul>
        </Section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatsBar({
  label,
  stats,
  maxChars,
  color,
}: {
  label: string;
  stats: { chars: number; words: number; tokens: number };
  maxChars: number;
  color: string;
}) {
  const pct = Math.round((stats.chars / maxChars) * 100);

  return (
    <div className="rounded-xl border border-(--border) bg-(--card) p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
          Response {label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-lg font-semibold">{stats.chars.toLocaleString()}</div>
          <div className="text-[10px] text-(--muted-foreground)">Characters</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{stats.words.toLocaleString()}</div>
          <div className="text-[10px] text-(--muted-foreground)">Words</div>
        </div>
        <div>
          <div className="text-lg font-semibold">~{stats.tokens.toLocaleString()}</div>
          <div className="text-[10px] text-(--muted-foreground)">Est. Tokens</div>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-(--border)">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AnalysisBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--muted-foreground)/40" />
      <span>{children}</span>
    </li>
  );
}
