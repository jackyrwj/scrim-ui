"use client";

import { ThinkingIndicator } from "./thinking-indicator";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const thinkingIndicatorControls: ComponentControls = {
  tag: "ThinkingIndicator",
  importFrom: "./thinking-indicator",
  controls: [
    {
      kind: "enum",
      name: "variant",
      label: "Variant",
      value: "dots",
      options: [
        { value: "dots", label: "Bouncing dots" },
        { value: "caret", label: "Blinking caret" },
        { value: "label", label: "Pulsing label" },
      ],
    },
    { kind: "text", name: "label", label: "Label", value: "Thinking" },
  ],
  presets: [
    {
      id: "dots",
      title: "Dots",
      note: "The most recognised 'working on it' signal in chat UIs.",
      values: { variant: "dots", label: "Thinking" },
    },
    {
      id: "caret",
      title: "Caret",
      note: "Reads as the model about to start typing — pairs with a streaming reveal.",
      values: { variant: "caret", label: "Writing" },
    },
    {
      id: "label",
      title: "Label",
      note: "For longer waits, where naming the work beats an abstract animation.",
      values: { variant: "label", label: "Researching" },
    },
  ],
};

export function renderThinkingIndicator(v: ControlValues, key: string) {
  return (
    <div key={key} className="flex justify-center">
      <ThinkingIndicator variant={v.variant as "dots" | "caret" | "label"} label={String(v.label)} />
    </div>
  );
}
