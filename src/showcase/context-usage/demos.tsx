"use client";

import * as React from "react";
import { ContextUsage, type ContextSegment } from "./context-usage";

/* evictionRank: lower goes first. No rank means it cannot be dropped. */
const HEALTHY: ContextSegment[] = [
  { label: "System prompt & tools", tokens: 3_400 },
  { label: "Pinned files (2)", tokens: 11_200, evictionRank: 3 },
  { label: "Retrieved passages", tokens: 8_900, evictionRank: 1 },
  { label: "Conversation history", tokens: 14_600, evictionRank: 2 },
];

const TIGHT: ContextSegment[] = [
  { label: "System prompt & tools", tokens: 3_400 },
  { label: "Pinned files (2)", tokens: 11_200, evictionRank: 3 },
  { label: "Retrieved passages", tokens: 22_800, evictionRank: 1 },
  { label: "Conversation history", tokens: 76_500, evictionRank: 2 },
];

const OVER: ContextSegment[] = [
  { label: "System prompt & tools", tokens: 3_400 },
  { label: "Pinned files (5)", tokens: 41_000, evictionRank: 3 },
  { label: "Retrieved passages", tokens: 22_800, evictionRank: 1 },
  { label: "Conversation history", tokens: 68_000, evictionRank: 2 },
];

export function DemoDefault() {
  return <ContextUsage window={128_000} segments={TIGHT} reserve={8_000} />;
}

export function DemoHealthy() {
  return <ContextUsage window={128_000} segments={HEALTHY} reserve={8_000} />;
}

export function DemoOverflowing() {
  return <ContextUsage window={128_000} segments={OVER} reserve={8_000} />;
}

export function DemoEstimated() {
  return <ContextUsage window={128_000} segments={HEALTHY} reserve={8_000} estimated />;
}
