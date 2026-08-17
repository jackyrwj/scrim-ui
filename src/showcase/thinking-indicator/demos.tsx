"use client";

import { ThinkingIndicator } from "./thinking-indicator";

export function DemoDots() {
  return <ThinkingIndicator variant="dots" label="Thinking" />;
}

export function DemoCaret() {
  return <ThinkingIndicator variant="caret" label="Writing" />;
}

export function DemoLabel() {
  return <ThinkingIndicator variant="label" label="Researching" />;
}
