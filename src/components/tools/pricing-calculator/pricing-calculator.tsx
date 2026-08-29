"use client";

import * as React from "react";
import { Section, Field, inputCls } from "../tool-ui";
import { VendorPicker } from "../vendor-picker";
import { BrandIcon } from "@/components/brands/brand-icon";
import { formatUSD, MODELS, monthlyCost, type Provider } from "./pricing";

/* ------------------------------------------------------------------ */
/* Provider styling                                                    */
/* ------------------------------------------------------------------ */

const PROVIDERS: Provider[] = ["OpenAI", "Anthropic", "Google", "DeepSeek"];

const PROVIDER_COLORS: Record<Provider, string> = {
  OpenAI: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Anthropic: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Google: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  DeepSeek: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function PricingCalculator() {
  const [inputTokens, setInputTokens] = React.useState(1000);
  const [outputTokens, setOutputTokens] = React.useState(500);
  const [requestsPerDay, setRequestsPerDay] = React.useState(100);
  const [activeProviders, setActiveProviders] = React.useState<Set<Provider>>(
    () => new Set(PROVIDERS)
  );

  function toggleProvider(p: Provider) {
    setActiveProviders((prev) => {
      const next = new Set(prev);
      if (next.has(p)) {
        if (next.size > 1) next.delete(p);
      } else {
        next.add(p);
      }
      return next;
    });
  }

  const cards = React.useMemo(() => {
    const filtered = MODELS.filter((m) => activeProviders.has(m.provider));
    const withCost = filtered.map((m) => ({
      model: m,
      cost: monthlyCost(m, inputTokens, outputTokens, requestsPerDay),
    }));
    withCost.sort((a, b) => a.cost - b.cost);
    return withCost;
  }, [inputTokens, outputTokens, requestsPerDay, activeProviders]);

  const cheapestCost = cards.length > 0 ? cards[0].cost : Infinity;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          AI Pricing Calculator
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-(--muted-foreground)">
          Compare monthly costs across models. Adjust your usage to see
          real-time price estimates.
        </p>
      </div>

      {/* Body */}
      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        {/* Left panel */}
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[340px]">
          <Section title="Usage Estimate">
            <div className="space-y-4">
              <Field label="Input tokens per request">
                <input
                  type="number"
                  min={0}
                  value={inputTokens}
                  onChange={(e) =>
                    setInputTokens(Math.max(0, Number(e.target.value)))
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Output tokens per request">
                <input
                  type="number"
                  min={0}
                  value={outputTokens}
                  onChange={(e) =>
                    setOutputTokens(Math.max(0, Number(e.target.value)))
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Requests per day">
                <input
                  type="number"
                  min={0}
                  value={requestsPerDay}
                  onChange={(e) =>
                    setRequestsPerDay(Math.max(0, Number(e.target.value)))
                  }
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* Quick summary */}
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center">
            <div className="text-xs font-medium text-(--muted-foreground)">
              Monthly requests
            </div>
            <div className="mt-1 text-xl font-bold tabular-nums">
              {(requestsPerDay * 30).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Right panel — model cards */}
        <div className="min-w-0 flex-1">
          <VendorPicker
            vendors={PROVIDERS}
            active={activeProviders}
            onSelect={toggleProvider}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {cards.map(({ model, cost }) => {
              const isCheapest = cost === cheapestCost && cards.length > 1;
              return (
                <div
                  key={model.name}
                  className={`relative rounded-xl border p-4 transition-colors ${
                    isCheapest
                      ? "border-green-400 bg-green-50/50 dark:border-green-600 dark:bg-green-950/20"
                      : `border-(--border) bg-(--card)`
                  }`}
                >
                  {/* Cheapest badge */}
                  {isCheapest && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Cheapest
                    </span>
                  )}

                  {/* Provider pill */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PROVIDER_COLORS[model.provider]}`}
                  >
                    <BrandIcon name={model.provider} size={11} tone="current" />
                    {model.provider}
                  </span>

                  {/* Model name */}
                  <h3 className="mt-2 text-sm font-semibold">{model.name}</h3>

                  {/* Monthly cost */}
                  <div className="mt-3 text-2xl font-bold tabular-nums">
                    {formatUSD(cost)}
                    <span className="ml-1 text-xs font-normal text-(--muted-foreground)">
                      /mo
                    </span>
                  </div>

                  {/* Per-1M breakdown */}
                  <div className="mt-3 space-y-1 text-xs tabular-nums text-(--muted-foreground)">
                    <div className="flex justify-between">
                      <span>Input per 1M tokens</span>
                      <span>${model.inputPer1M.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output per 1M tokens</span>
                      <span>${model.outputPer1M.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {cards.length === 0 && (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-(--border) text-sm text-(--muted-foreground)">
              Select at least one provider to see pricing.
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs leading-5 text-(--muted-foreground)">
        Prices reflect public API pricing and may change. This tool provides
        estimates only.
      </p>
    </div>
  );
}
