"use client";

import * as React from "react";
import { BrandIcon } from "@/components/brands/brand-icon";
import { textStats } from "../response-diff/stats";
import { sliceTo, useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The AI Response Diff, comparing two model answers in a card: both
 * responses paste in, and the stats + analysis below are recomputed by the
 * tool's own helpers as the text arrives — the exact numbers the tool
 * shows, shrinking/growing live with the reveal.
 */

const MODEL_A = "Claude Sonnet 5";
const MODEL_B = "GPT-5.6 Sol";

const TEXT_A = `Here's a concise debounce in TypeScript:

\`\`\`typescript
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
\`\`\`

The closure captures \`timer\`; each call resets it.`;

const TEXT_B = `To implement debounce, delay execution until enough time has passed since the last call:

\`\`\`typescript
function debounce(func, waitMs) {
  let timeoutId = null;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, waitMs);
  };
}
\`\`\`

Useful for search inputs and resize handlers.`;

const REVEAL_MS = 3400;
const LOOP_MS = REVEAL_MS + 3000;

export function ResponseDiffDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  /* Revealed text, not progress: the slices move at word boundaries and
     React skips the ticks where nothing changed. */
  const [a, setA] = React.useState("");
  const [b, setB] = React.useState("");
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      const elapsed = (performance.now() - started) % LOOP_MS;
      const p = Math.min(1, elapsed / REVEAL_MS);
      setA(sliceTo(TEXT_A, p));
      setB(sliceTo(TEXT_B, p));
      setDone(p >= 1);
    }, 60);
    return () => window.clearInterval(id);
  }, [playing]);

  const textA = reduced ? TEXT_A : a;
  const textB = reduced ? TEXT_B : b;
  const complete = reduced || done;

  const statsA = React.useMemo(() => textStats(textA), [textA]);
  const statsB = React.useMemo(() => textStats(textB), [textB]);
  const analysis = React.useMemo(() => {
    const pct = Math.abs(
      Math.round(((statsA.chars - statsB.chars) / Math.max(statsB.chars, 1)) * 100),
    );
    return [
      `A is ${pct}% ${statsA.chars < statsB.chars ? "shorter" : "longer"} than B`,
      TEXT_A.includes("```") && TEXT_B.includes("```")
        ? "Both responses include code examples"
        : "Responses differ in structure",
      TEXT_A.includes("=> {") && TEXT_B.includes("function ")
        ? "A uses an arrow function, B a named function"
        : "A and B take different approaches",
    ];
  }, [statsA.chars, statsB.chars]);

  return (
    <div ref={frameRef} className="flex h-full flex-col justify-center gap-2.5 p-2">
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            [MODEL_A, textA, statsA, "border-blue-500/30"],
            [MODEL_B, textB, statsB, "border-amber-500/30"],
          ] as const
        ).map(([model, text, stats, border]) => (
          <div key={model} className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5">
              <BrandIcon name={model} size={12} />
              <span className="truncate text-[11px] font-medium text-(--foreground)">{model}</span>
            </div>
            <div className={`h-[190px] overflow-hidden rounded-lg border ${border} bg-(--background)`}>
              <pre className="h-full overflow-hidden whitespace-pre-wrap px-2 py-1.5 font-mono text-[10px] leading-[1.4] text-(--foreground)">
                {text}
              </pre>
            </div>
            <p className="mt-1 font-mono text-[10px] tabular-nums text-(--muted-foreground)">
              {stats.chars.toLocaleString()} chars · {stats.words} words · ~
              {stats.tokens.toLocaleString()} tok
            </p>
          </div>
        ))}
      </div>

      <ul
        className={`space-y-1 overflow-hidden text-[11px] leading-4 text-(--muted-foreground) transition-opacity duration-500 ${
          complete ? "opacity-100" : "opacity-0"
        }`}
      >
        {analysis.map((line) => (
          <li key={line} className="flex items-start gap-1.5">
            <span className="mt-[5px] inline-block h-1 w-1 shrink-0 rounded-full bg-(--muted-foreground)/50" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
