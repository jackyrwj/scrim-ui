"use client";

import * as React from "react";
import { CostMeter, type ModelPrice, type Usage } from "./cost-meter";

/* Sonnet-class rates, USD per million tokens. Kept at the call site on
   purpose — a rate table inside the component is a rate table that goes stale
   in someone else's node_modules. */
const PRICE: ModelPrice = { input: 3, cachedInput: 0.3, output: 15 };

const TURN: Usage = {
  inputTokens: 18_420,
  cachedInputTokens: 15_900,
  outputTokens: 1_240,
  reasoningTokens: 780,
};

const CONVERSATION: Usage = {
  inputTokens: 142_800,
  cachedInputTokens: 118_500,
  outputTokens: 9_640,
  reasoningTokens: 4_100,
};

export function DemoDefault() {
  return (
    <CostMeter
      model="claude-sonnet-5"
      price={PRICE}
      usage={TURN}
      total={CONVERSATION}
      defaultOpen
    />
  );
}

export function DemoMessage() {
  return <CostMeter model="claude-sonnet-5" price={PRICE} usage={TURN} />;
}

export function DemoConversation() {
  return <CostMeter model="claude-sonnet-5" price={PRICE} usage={TURN} total={CONVERSATION} />;
}

export function DemoBudget() {
  return (
    <CostMeter
      model="claude-sonnet-5"
      price={PRICE}
      usage={TURN}
      total={CONVERSATION}
      budgetUsd={0.25}
    />
  );
}

/* The provider reported input and nothing else — a stream that failed
   mid-turn, or a gateway that does not pass output counts through. */
export function DemoApproximate() {
  return (
    <CostMeter
      model="claude-sonnet-5"
      price={PRICE}
      usage={{ inputTokens: 18_420, cachedInputTokens: 15_900 }}
      defaultOpen
    />
  );
}

export function DemoStreaming() {
  return (
    <CostMeter
      model="claude-sonnet-5"
      price={PRICE}
      usage={{ inputTokens: 18_420, cachedInputTokens: 15_900, outputTokens: 310 }}
      total={CONVERSATION}
      streaming
      defaultOpen
    />
  );
}
