"use client";

import * as React from "react";
import { CostMeter, type ModelPrice, type Usage } from "./cost-meter";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const PRICE: ModelPrice = { input: 3, cachedInput: 0.3, output: 15 };

const CONVERSATION: Usage = {
  inputTokens: 142_800,
  cachedInputTokens: 118_500,
  outputTokens: 9_640,
  reasoningTokens: 4_100,
};

const PREAMBLE = `// USD per million tokens. Kept at the call site — a rate table baked into a
// component is a rate table that goes stale in someone else's node_modules.
const PRICE = { input: 3, cachedInput: 0.3, output: 15 };`;

export const costMeterControls: ComponentControls = {
  tag: "CostMeter",
  importFrom: "./cost-meter",
  controls: [
    { kind: "text", name: "model", label: "Model", value: "claude-sonnet-5" },
    { kind: "number", name: "inputTokens", label: "Input tokens (cache included)", value: 18420, min: 0, step: 100 },
    { kind: "number", name: "cachedInputTokens", label: "…of which cached", value: 15900, min: 0, step: 100 },
    { kind: "number", name: "outputTokens", label: "Output tokens (−1 = not reported)", value: 1240, min: -1, step: 10 },
    { kind: "number", name: "reasoningTokens", label: "…of which reasoning", value: 780, min: 0, step: 10 },
    { kind: "boolean", name: "total", label: "Show the conversation total", value: true },
    { kind: "number", name: "budgetUsd", label: "Budget in USD (0 = none)", value: 0, min: 0, max: 5, step: 0.05 },
    { kind: "boolean", name: "streaming", label: "Still generating", value: false },
    { kind: "boolean", name: "defaultOpen", label: "Breakdown open", value: true },
  ],
  snippet: (v) => {
    const usage = [
      `  inputTokens: ${v.inputTokens},`,
      `  cachedInputTokens: ${v.cachedInputTokens},`,
      Number(v.outputTokens) < 0
        ? "  // outputTokens absent — undefined is not zero, and the meter says ~"
        : `  outputTokens: ${v.outputTokens},`,
      Number(v.reasoningTokens) > 0
        ? `  reasoningTokens: ${v.reasoningTokens}, // already inside outputTokens`
        : null,
    ].filter(Boolean);

    const props = [
      `  model="${v.model}"`,
      "  price={PRICE}",
      "  usage={usage}",
      v.total ? "  total={conversationUsage}" : null,
      Number(v.budgetUsd) > 0 ? `  budgetUsd={${v.budgetUsd}}` : null,
      v.streaming ? "  streaming" : null,
      v.defaultOpen ? "  defaultOpen" : null,
    ].filter(Boolean);

    return `${PREAMBLE}\n\nconst usage = {\n${usage.join("\n")}\n};\n\n<CostMeter\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "message",
      title: "Per message",
      note: "One turn, 86% of its input served from cache. Priced at the fresh rate it would read four times higher.",
      values: { total: false, budgetUsd: 0, streaming: false, outputTokens: 1240, defaultOpen: true },
    },
    {
      id: "conversation",
      title: "Per conversation",
      note: "The running total leads and the turn moves into the breakdown — which is the right way round once a conversation is long enough to matter.",
      values: { total: true, budgetUsd: 0, streaming: false, outputTokens: 1240, defaultOpen: true },
    },
    {
      id: "budget",
      title: "Against a budget",
      note: "A cap turns an abstract number into a decision. The bar clamps at full rather than overflowing its track.",
      values: { total: true, budgetUsd: 0.25, streaming: false, outputTokens: 1240, defaultOpen: false },
    },
    {
      id: "approximate",
      title: "Provider reported nothing",
      note: "Output tokens missing. Undefined is not zero — the total becomes a lower bound and says so, because $0.00 for 'we do not know' is the worst available answer.",
      values: { outputTokens: -1, reasoningTokens: 0, total: false, budgetUsd: 0, streaming: false, defaultOpen: true },
    },
    {
      id: "streaming",
      title: "Mid-stream",
      note: "Output is still climbing, so the figure is labelled a running subtotal instead of being animated as though it had settled.",
      values: { outputTokens: 310, reasoningTokens: 0, total: true, budgetUsd: 0, streaming: true, defaultOpen: true },
    },
  ],
};

export function renderCostMeter(v: ControlValues, key: string) {
  const out = Number(v.outputTokens);
  const usage: Usage = {
    inputTokens: Number(v.inputTokens),
    cachedInputTokens: Number(v.cachedInputTokens),
    outputTokens: out < 0 ? undefined : out,
    reasoningTokens: Number(v.reasoningTokens) > 0 ? Number(v.reasoningTokens) : undefined,
  };

  return (
    <CostMeter
      key={key}
      model={String(v.model)}
      price={PRICE}
      usage={usage}
      total={v.total ? CONVERSATION : undefined}
      budgetUsd={Number(v.budgetUsd) > 0 ? Number(v.budgetUsd) : undefined}
      streaming={Boolean(v.streaming)}
      defaultOpen={Boolean(v.defaultOpen)}
    />
  );
}
