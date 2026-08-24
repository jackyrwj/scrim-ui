"use client";

import { MemorySuggestion } from "./memory-suggestion";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const memorySuggestionControls: ComponentControls = {
  tag: "MemorySuggestion",
  importFrom: "./memory-suggestion",
  controls: [
    {
      kind: "text",
      name: "fact",
      label: "Fact",
      value: "You prefer TypeScript over JavaScript",
      multiline: true,
    },
    { kind: "boolean", name: "saved", label: "Saved", value: false },
  ],
  handlers: ["onSave", "onDismiss", "onUndo"],
  presets: [
    {
      id: "suggestion",
      title: "Suggestion",
      note: "The assistant proposes saving a fact. Ask before you store — the user keeps control.",
      values: { saved: false },
    },
    {
      id: "saved",
      title: "Saved",
      note: "Confirmation after saving, with an Undo path so a wrong save is never permanent.",
      values: { saved: true },
    },
  ],
};

export function renderMemorySuggestion(v: ControlValues, key: string) {
  return (
    <MemorySuggestion
      key={key}
      fact={String(v.fact)}
      saved={Boolean(v.saved)}
      onSave={() => {}}
      onDismiss={() => {}}
      onUndo={() => {}}
    />
  );
}
