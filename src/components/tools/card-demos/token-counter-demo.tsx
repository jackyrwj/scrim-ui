"use client";

import * as React from "react";
import { BrandIcon } from "@/components/brands/brand-icon";
import { countTextStats, formatCost, getEstimates } from "../token-counter/count-tokens";
import { sliceTo, useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The Prompt Token Counter, counting a prompt as it is typed in a card.
 *
 * The numbers on screen are real: the revealed text runs through the
 * tool's own heuristics every frame, so tokens and costs tick up as the
 * prompt grows — exactly the calculation the tool sells. The exact
 * tokenizer is deliberately NOT loaded here; it is a ~2 MB download the
 * tool itself keeps behind a button, and a card is not that button.
 */

const PROMPT =
  "You are a support assistant for a fintech app. Answer in the user's language. Never speculate about account balances — always call the ledger tool first.";

const TYPE_MS = 4200;
const HOLD_MS = 3200;

const ROWS = ["GPT-5.6 Sol", "Claude Sonnet 5", "Gemini 3.7 Flash"];

export function TokenCounterDemo() {
  /* State is the revealed TEXT, not a progress ratio: the slice only
     moves at word boundaries, and React bails out of re-rendering when
     the string is unchanged — so the panel repaints a few times a
     second instead of 25. */
  const [typed, setTyped] = React.useState("");

  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  /* Elapsed-time reveal with a hold at the end, then the loop restarts
     from an empty box. */
  React.useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      const elapsed = (performance.now() - started) % (TYPE_MS + HOLD_MS);
      setTyped(sliceTo(PROMPT, Math.min(1, elapsed / TYPE_MS)));
    }, 40);
    return () => window.clearInterval(id);
  }, [playing]);

  const text = reduced ? PROMPT : typed;
  const stats = React.useMemo(() => countTextStats(text), [text]);
  const estimates = React.useMemo(
    () => getEstimates(text).filter((e) => ROWS.includes(e.model.name)),
    [text],
  );

  return (
    <div ref={frameRef} className="flex h-full flex-col justify-center gap-3 p-1">
      {/* The prompt box, styled like the tool's own textarea. */}
      <div className="relative rounded-lg border border-(--border) bg-(--background) px-3 py-2.5">
        <p className="min-h-[5.5rem] font-mono text-[12.5px] leading-5 text-(--foreground)">
          {text}
          {!reduced && text.length < PROMPT.length && (
            <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-(--muted-foreground)" />
          )}
        </p>
        <span className="absolute right-2.5 bottom-2 font-mono text-[10px] text-(--muted-foreground)">
          {stats.characters} chars · {stats.words} words
        </span>
      </div>

      {/* Live estimates — the tool's real heuristic, recomputed as the
          prompt grows. */}
      <div className="overflow-hidden rounded-lg border border-(--border) bg-(--card)">
        {estimates.map((e) => (
          <div
            key={e.model.name}
            className="flex items-center gap-2 border-b border-(--border) px-3 py-2 text-xs last:border-b-0"
          >
            <BrandIcon name={e.model.name} size={13} />
            <span className="min-w-0 flex-1 truncate text-(--foreground)">{e.model.name}</span>
            <span className="font-mono tabular-nums text-(--muted-foreground)">
              ~{e.tokens.toLocaleString()} tok
            </span>
            <span className="w-16 text-right font-mono tabular-nums" style={{ color: "var(--primary)" }}>
              {formatCost(e.inputCost)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-(--muted-foreground)">
        Estimated · heuristic · counts locally
      </p>
    </div>
  );
}
