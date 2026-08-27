import { getModel } from "./models";

/**
 * What a step cost.
 *
 * A number on screen that says "$0.14" is a claim, and a wrong claim about
 * money is a support ticket. So this file is deliberately pedantic about the
 * three things that make naive token arithmetic wrong:
 *
 *  1. **Cached input is not input.** On an agent run the same prompt prefix is
 *     re-read on every step, and providers charge a tenth or less for a cache
 *     read. Multiplying `inputTokens` by the input rate over-bills a 40-step
 *     run by an order of magnitude.
 *  2. **Reasoning tokens are billed and invisible.** They are already counted
 *     inside `outputTokens` — adding `reasoningTokens` on top double-counts.
 *     They are broken out here only so the UI can *show* what you paid for
 *     but never got to read.
 *  3. **Usage can be `undefined`.** Not every provider reports every field,
 *     and a stream that fails mid-step reports none of them. `undefined` is
 *     not zero, and rendering "$0.00" for "we do not know" is the one
 *     outcome worse than rendering nothing.
 *
 * Hence `exact: false` on any total built from an incomplete usage record.
 * The UI shows a `~` in front of those; see components/step-card.tsx.
 */

export type Usage = {
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
};

export type Cost = {
  usd: number;
  /** False when a field the price depends on was missing. */
  exact: boolean;
};

export const ZERO_USAGE: Usage = {};

/** Sums two usage records, treating a missing field as missing, not as zero. */
export function addUsage(a: Usage, b: Usage): Usage {
  const add = (x?: number, y?: number) => (x === undefined && y === undefined ? undefined : (x ?? 0) + (y ?? 0));
  return {
    inputTokens: add(a.inputTokens, b.inputTokens),
    cachedInputTokens: add(a.cachedInputTokens, b.cachedInputTokens),
    outputTokens: add(a.outputTokens, b.outputTokens),
    reasoningTokens: add(a.reasoningTokens, b.reasoningTokens),
  };
}

export function totalTokens(usage: Usage): number {
  return (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
}

export function costOf(modelId: string, usage: Usage): Cost {
  const price = getModel(modelId)?.price;
  if (!price) return { usd: 0, exact: false };

  const cached = usage.cachedInputTokens ?? 0;
  /* `inputTokens` is the total the provider billed for input, cache reads
     included. Subtracting the cached share is what stops the same tokens
     being charged twice at the full rate. Clamped at zero because a provider
     that reports the two independently can, briefly, disagree with itself. */
  const fresh = Math.max(0, (usage.inputTokens ?? 0) - cached);

  const usd =
    (fresh / 1_000_000) * price.input +
    (cached / 1_000_000) * price.cachedInput +
    ((usage.outputTokens ?? 0) / 1_000_000) * price.output;

  return {
    usd,
    exact: usage.inputTokens !== undefined && usage.outputTokens !== undefined,
  };
}

/**
 * Money, formatted for a meter that updates every step.
 *
 * Four decimals under a cent, because a run that shows "$0.00" for its first
 * six steps and then jumps to "$0.01" looks broken. Above a cent, two — the
 * extra digits are noise once the number is large enough to care about.
 */
export function formatCost({ usd, exact }: Cost): string {
  const value = usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2);
  return `${exact ? "" : "~"}$${value}`;
}

export function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}
