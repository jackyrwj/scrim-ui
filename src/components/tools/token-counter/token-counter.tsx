"use client";

import * as React from "react";
import { Section } from "../tool-ui";
import { CopyButton } from "@/components/component-page/copy-button";
import type { TokenConfig } from "./types";
import { defaultConfig } from "./types";
import {
  countTextStats,
  getEstimates,
  formatCost,
  buildStatsSummary,
} from "./count-tokens";

const FAMILY_COLORS: Record<string, string> = {
  OpenAI: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Anthropic: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Google: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

export function TokenCounter() {
  const [config, setConfig] = React.useState<TokenConfig>(
    structuredClone(defaultConfig)
  );

  const stats = React.useMemo(() => countTextStats(config.text), [config.text]);
  const estimates = React.useMemo(() => getEstimates(config.text), [config.text]);
  const summary = React.useMemo(
    () => buildStatsSummary(stats, estimates),
    [stats, estimates]
  );

  const statCards = [
    { label: "Characters", value: stats.characters },
    { label: "Words", value: stats.words },
    { label: "Lines", value: stats.lines },
    { label: "Sentences", value: stats.sentences },
  ];

  const families = ["OpenAI", "Anthropic", "Google"] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Prompt Token Counter
          </h1>
          <p className="mt-1.5 text-sm text-(--muted-foreground)">
            Paste text and see estimated token counts and API costs across models.
            All counting runs locally in your browser.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfig(structuredClone(defaultConfig))}
            className="inline-flex h-8 items-center rounded-lg border border-(--border) px-3 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Reset
          </button>
          <CopyButton
            code={summary}
            label="Copy Stats"
            disabled={!config.text.trim()}
          />
        </div>
      </div>

      {/* Textarea */}
      <div className="mt-8">
        <Section title="Input Text">
          <div className="relative">
            <textarea
              value={config.text}
              onChange={(e) => setConfig({ text: e.target.value })}
              placeholder="Paste your prompt or text here..."
              rows={10}
              className="w-full resize-y rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 font-mono text-sm outline-none transition-colors focus:border-(--foreground)"
            />
            <span className="absolute bottom-2.5 right-3 text-xs text-(--muted-foreground)">
              {stats.characters.toLocaleString()} chars
            </span>
          </div>
        </Section>
      </div>

      {/* Stats bar */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-(--border) bg-(--card) p-3 text-center"
          >
            <div className="text-xl font-bold tabular-nums">
              {s.value.toLocaleString()}
            </div>
            <div className="mt-0.5 text-xs text-(--muted-foreground)">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Token estimates */}
      <div className="mt-8">
        <Section title="Token Estimates">
          <p className="mb-4 text-xs text-(--muted-foreground)">
            Approximate counts using word-based heuristics. Actual tokens vary by
            tokenizer.
          </p>

          {families.map((family) => {
            const models = estimates.filter((e) => e.model.family === family);
            return (
              <div key={family} className="mb-5 last:mb-0">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${FAMILY_COLORS[family]}`}
                  >
                    {family}
                  </span>
                </div>
                <div className="space-y-2">
                  {models.map((e) => (
                    <div
                      key={e.model.name}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-(--border) px-3 py-2.5"
                    >
                      <div className="text-sm font-medium">{e.model.name}</div>
                      <div className="flex items-center gap-4 text-xs tabular-nums text-(--muted-foreground)">
                        <span>
                          ~{e.tokens.toLocaleString()} tokens
                        </span>
                        <span title="Estimated cost if used as input">
                          In: {formatCost(e.inputCost)}
                        </span>
                        <span title="Estimated cost if used as output">
                          Out: {formatCost(e.outputCost)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Section>
      </div>

      <p className="mt-6 text-center text-xs text-(--muted-foreground)">
        Estimates are approximate. Prices reflect public API pricing as of mid-2026
        and may change.
      </p>
    </div>
  );
}
