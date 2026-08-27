"use client";

import { RefusalMessage } from "./refusal-message";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const refusalMessageControls: ComponentControls = {
  tag: "RefusalMessage",
  importFrom: "./refusal-message",
  controls: [
    {
      kind: "text",
      name: "message",
      label: "Refusal",
      value: "I can't help with gaining access to a network you don't own.",
      multiline: true,
    },
    {
      kind: "text",
      name: "reason",
      label: "Why (plain language)",
      value:
        "This falls under unauthorized access — I can only help with networks you administer yourself.",
      multiline: true,
    },
    {
      kind: "text",
      name: "suggestion",
      label: "Redirect",
      value: "Ask about securing my own home network instead",
    },
  ],
  handlers: ["onSuggestion"],
  presets: [
    {
      id: "redirect",
      title: "With redirect",
      note: "The full pattern: what won't be done, why in plain terms, and the one pivot still on the table — as a button.",
      values: {},
    },
    {
      id: "no-reason",
      title: "No explanation",
      note: "Acceptable for obvious cases, but the reader learns nothing about where the line is.",
      values: { reason: "" },
    },
    {
      id: "bare",
      title: "Bare refusal",
      note: "The anti-pattern to avoid — a dead end with no lever. Shown here so the difference is visible.",
      values: {
        message: "I can't generate a medical diagnosis from a photo.",
        reason: "",
        suggestion: "",
      },
    },
  ],
};

export function renderRefusalMessage(v: ControlValues, key: string) {
  return (
    <RefusalMessage
      key={key}
      message={String(v.message)}
      reason={v.reason ? String(v.reason) : undefined}
      suggestion={v.suggestion ? String(v.suggestion) : undefined}
      onSuggestion={() => {}}
    />
  );
}
