"use client";

import * as React from "react";

/**
 * Live spend, per message and per conversation.
 *
 * A number on screen that says "$0.14" is a claim, and a wrong claim about
 * money is a support ticket. Almost every meter shipped in an AI product gets
 * this wrong in one of four ways, and each one has an answer here:
 *
 *  1. **Cached input is not input.** The same prompt prefix is re-read on
 *     every turn, and providers charge a tenth or less for a cache read.
 *     `inputTokens` is the total billed for input, cache reads included, so
 *     multiplying it by the fresh rate over-bills a long conversation by an
 *     order of magnitude. The cached share is subtracted and priced apart.
 *  2. **Reasoning tokens are billed and invisible.** They are already inside
 *     `outputTokens`; adding `reasoningTokens` on top double-counts. They are
 *     broken out here only so the meter can *show* what was paid for and
 *     never read — which is usually the line that explains the bill.
 *  3. **Usage can be `undefined`.** Not every provider reports every field,
 *     and a stream that fails mid-turn reports none of them. `undefined` is
 *     not zero. Rendering "$0.00" for "we do not know" is the one outcome
 *     worse than rendering nothing, so an incomplete usage record produces
 *     `exact: false` and the meter shows a visible `~`.
 *  4. **Sub-cent precision.** A meter that reads $0.00 for six turns and then
 *     jumps to $0.01 looks broken. Four decimals under a cent, two above it,
 *     where the extra digits stop being information.
 *
 * The prices live with the caller, not in here. A rate table baked into a
 * component is a rate table that goes stale in someone else's node_modules.
 */

/* ------------------------------------------------------------------ */
/* Arithmetic                                                          */
/* ------------------------------------------------------------------ */

export type Usage = {
  inputTokens?: number;
  /** The share of `inputTokens` that was served from cache, not added to it. */
  cachedInputTokens?: number;
  outputTokens?: number;
  /** Already counted inside `outputTokens`. Broken out to display, never to add. */
  reasoningTokens?: number;
};

/** USD per million tokens, as every provider quotes them. */
export type ModelPrice = {
  input: number;
  cachedInput: number;
  output: number;
};

export type Cost = {
  usd: number;
  /** False when a field the price depends on was missing. */
  exact: boolean;
};

/** Sums two usage records, treating a missing field as missing, not as zero. */
export function addUsage(a: Usage, b: Usage): Usage {
  const add = (x?: number, y?: number) =>
    x === undefined && y === undefined ? undefined : (x ?? 0) + (y ?? 0);
  return {
    inputTokens: add(a.inputTokens, b.inputTokens),
    cachedInputTokens: add(a.cachedInputTokens, b.cachedInputTokens),
    outputTokens: add(a.outputTokens, b.outputTokens),
    reasoningTokens: add(a.reasoningTokens, b.reasoningTokens),
  };
}

export function costOf(usage: Usage, price: ModelPrice): Cost {
  const cached = usage.cachedInputTokens ?? 0;
  /* Clamped at zero because a provider that reports the two independently
     can, briefly, disagree with itself mid-stream. */
  const fresh = Math.max(0, (usage.inputTokens ?? 0) - cached);

  const usd =
    (fresh / 1_000_000) * price.input +
    (cached / 1_000_000) * price.cachedInput +
    ((usage.outputTokens ?? 0) / 1_000_000) * price.output;

  return { usd, exact: usage.inputTokens !== undefined && usage.outputTokens !== undefined };
}

export function formatCost({ usd, exact }: Cost): string {
  const value = usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2);
  return `${exact ? "" : "~"}$${value}`;
}

export function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* CostMeter                                                           */
/* ------------------------------------------------------------------ */

export type CostMeterProps = {
  /** Shown as attribution — the rates below are only true for one model. */
  model: string;
  price: ModelPrice;
  /** This turn. */
  usage: Usage;
  /** The conversation so far, including this turn. Omit for a per-message meter. */
  total?: Usage;
  /** A cap to render progress against, in USD. */
  budgetUsd?: number;
  /**
   * True while the turn is still generating. Output tokens are still climbing,
   * so the figure is a running subtotal rather than a final one — and it is
   * labelled as such instead of being animated as though it were settled.
   */
  streaming?: boolean;
  defaultOpen?: boolean;
  className?: string;
};

export function CostMeter({
  model,
  price,
  usage,
  total,
  budgetUsd,
  streaming = false,
  defaultOpen = false,
  className = "",
}: CostMeterProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  const turn = costOf(usage, price);
  const running = total ? costOf(total, price) : undefined;
  const headline = running ?? turn;

  const cached = usage.cachedInputTokens ?? 0;
  const fresh = Math.max(0, (usage.inputTokens ?? 0) - cached);
  const reasoning = usage.reasoningTokens ?? 0;

  /* Clamped at 1: a bar that overflows its track is a rendering bug, and a
     bar pinned at full next to a number that keeps climbing is not. */
  const spent = budgetUsd ? Math.min(1, headline.usd / budgetUsd) : 0;
  const overBudget = budgetUsd !== undefined && headline.usd > budgetUsd;

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center gap-3 px-3.5 py-2.5">
        <span className="min-w-0 truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          {model}
        </span>

        <span className="ml-auto flex shrink-0 items-baseline gap-2.5">
          <span className="tabular-nums text-[11px] text-zinc-500 dark:text-zinc-400">
            {usage.inputTokens === undefined ? "—" : formatTokens(usage.inputTokens)} in ·{" "}
            {usage.outputTokens === undefined ? "—" : formatTokens(usage.outputTokens)} out
          </span>
          <span
            /* The figure changes while the reader is looking at it, so it is
               announced politely rather than on every token. */
            aria-live="polite"
            className={`tabular-nums text-sm font-medium ${
              overBudget ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"
            }`}
            title={headline.exact ? undefined : "Approximate — the provider did not report every field."}
          >
            {formatCost(headline)}
          </span>
        </span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Hide the breakdown" : "Show the breakdown"}
          className="-mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <ChevronIcon className={open ? "rotate-180" : ""} />
        </button>
      </div>

      {budgetUsd !== undefined && (
        <div className="px-3.5 pb-2.5">
          <div className="h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                overBudget ? "bg-red-500" : spent > 0.8 ? "bg-amber-500" : "bg-zinc-400 dark:bg-zinc-500"
              }`}
              style={{ width: `${spent * 100}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            {overBudget
              ? `Over the ${formatCost({ usd: budgetUsd, exact: true })} budget for this conversation.`
              : `of ${formatCost({ usd: budgetUsd, exact: true })} budgeted`}
          </p>
        </div>
      )}

      {open && (
        <dl className="space-y-1.5 border-t border-zinc-100 px-3.5 py-3 text-[11px] dark:border-zinc-800">
          <Row
            label="Fresh input"
            value={usage.inputTokens === undefined ? "not reported" : `${formatTokens(fresh)} · ${money((fresh / 1e6) * price.input)}`}
            hint={`$${price.input}/M`}
          />
          {/* Shown even at zero, because "no cache hits on this turn" is
              information — it is the difference between a conversation that
              is getting cheaper and one that is not. */}
          <Row
            label="Cached input"
            value={`${formatTokens(cached)} · ${money((cached / 1e6) * price.cachedInput)}`}
            hint={`$${price.cachedInput}/M`}
          />
          <Row
            label="Output"
            value={usage.outputTokens === undefined ? "not reported" : `${formatTokens(usage.outputTokens)} · ${money(((usage.outputTokens ?? 0) / 1e6) * price.output)}`}
            hint={`$${price.output}/M`}
          />
          {reasoning > 0 && (
            <Row
              label="…of which reasoning"
              value={formatTokens(reasoning)}
              hint="billed, not shown"
              muted
            />
          )}

          {total && (
            <div className="mt-2.5 flex items-baseline justify-between border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
              <dt className="text-zinc-500 dark:text-zinc-400">This turn</dt>
              <dd className="tabular-nums font-medium text-zinc-700 dark:text-zinc-200">
                {formatCost(turn)}
              </dd>
            </div>
          )}

          {!headline.exact && (
            <p className="pt-1 text-[11px] leading-4 text-amber-600 dark:text-amber-500">
              The provider did not report every field for this turn, so the total is a lower bound.
              That is what the ~ means.
            </p>
          )}
          {streaming && (
            <p className="pt-1 text-[11px] leading-4 text-zinc-400 dark:text-zinc-500">
              Still generating — output tokens are a running subtotal.
            </p>
          )}
        </dl>
      )}
    </div>
  );
}

function Row({ label, value, hint, muted = false }: { label: string; value: string; hint?: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={muted ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"}>
        {label}
        {hint && <span className="ml-1.5 text-zinc-300 dark:text-zinc-600">{hint}</span>}
      </dt>
      <dd className={`shrink-0 tabular-nums ${muted ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-200"}`}>
        {value}
      </dd>
    </div>
  );
}

function money(usd: number): string {
  return `$${usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2)}`;
}
