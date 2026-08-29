"use client";

import * as React from "react";
import { BrandIcon } from "@/components/brands/brand-icon";
import { formatUSD, MODELS, monthlyCost } from "../pricing-calculator/pricing";
import { useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The API Pricing Calculator, repriced in a card. Usage per request is
 * fixed; the requests-per-day figure climbs in steps, and every monthly
 * cost on screen is recomputed by the tool's own monthlyCost() as it
 * climbs — the same math the calculator runs on its sliders.
 */

const ROWS = ["Claude Sonnet 4", "GPT-4.1", "DeepSeek V3"];

const INPUT_TOKENS = 2000;
const OUTPUT_TOKENS = 600;

/* requests/day climbs through these stops, then the month resets. */
const STOPS = [50, 150, 400, 1200];
const STEP_MS = 1900;

export function PricingCalculatorDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  const [stop, setStop] = React.useState(0);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(
      () => setStop((s) => (s + 1) % (STOPS.length + 1)),
      STEP_MS,
    );
    return () => window.clearInterval(id);
  }, [playing]);

  /* The extra stop past the end holds the final figures, then wraps. */
  const idx = Math.min(stop, STOPS.length - 1);
  const requests = reduced ? STOPS[2] : STOPS[idx];
  const rows = React.useMemo(
    () => MODELS.filter((m) => ROWS.includes(m.name)),
    [],
  );

  return (
    <div ref={frameRef} className="flex h-full flex-col justify-center gap-3 p-2">
      {/* Per-request usage, as the calculator's inputs hold it. */}
      <div className="rounded-lg border border-(--border) bg-(--background) px-3 py-2">
        <p className="font-mono text-[11px] text-(--muted-foreground)">
          per request · {INPUT_TOKENS.toLocaleString()} in · {OUTPUT_TOKENS.toLocaleString()} out
          tokens
        </p>
        <p className="mt-0.5 font-mono text-sm font-medium tabular-nums text-(--foreground)">
          {requests.toLocaleString()} requests / day
        </p>
      </div>

      {/* Monthly cost per model — real monthlyCost(), live. */}
      <div className="overflow-hidden rounded-lg border border-(--border) bg-(--card)">
        {rows.map((m) => {
          const cost = monthlyCost(m, INPUT_TOKENS, OUTPUT_TOKENS, requests);
          return (
            <div
              key={m.name}
              className="flex items-center gap-2 border-b border-(--border) px-3 py-2 text-xs last:border-b-0"
            >
              <BrandIcon name={m.name} size={13} />
              <span className="min-w-0 flex-1 truncate text-(--foreground)">{m.name}</span>
              <span className="truncate text-[10px] text-(--muted-foreground)">
                ${m.inputPer1M}/${m.outputPer1M} per 1M
              </span>
              <span
                className="w-14 text-right font-mono text-[13px] tabular-nums"
                style={{ color: "var(--primary)" }}
              >
                {formatUSD(cost)}
                <span className="text-[9px] text-(--muted-foreground)">/mo</span>
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-(--muted-foreground)">
        × 30 days · counts locally
      </p>
    </div>
  );
}
