"use client";

import { MemoryToast } from "./memory-toast";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const memoryToastControls: ComponentControls = {
  tag: "MemoryToast",
  importFrom: "./memory-toast",
  controls: [
    {
      kind: "enum",
      name: "kind",
      label: "Kind",
      value: "saved",
      options: [
        { value: "saved", label: "Saved" },
        { value: "updated", label: "Updated" },
        { value: "forgotten", label: "Forgotten" },
      ],
    },
    {
      kind: "text",
      name: "fact",
      label: "Saved fact",
      value: "Prefers concise, bullet-point answers",
    },
  ],
  handlers: ["onUndo", "onManage"],
  presets: [
    {
      id: "saved",
      title: "Saved",
      note: "The receipt: the fact itself is the content, 'Saved to memory' is the label. Undo is the primary action.",
      values: { kind: "saved" },
    },
    {
      id: "updated",
      title: "Updated",
      note: "An existing fact changed — same receipt, different label.",
      values: { kind: "updated", fact: "Works as a backend engineer, mostly Go" },
    },
    {
      id: "forgotten",
      title: "Forgotten",
      note: "The confirmation after Undo or a delete request — the loop closes visibly.",
      values: { kind: "forgotten" },
    },
  ],
};

export function renderMemoryToast(v: ControlValues, key: string) {
  return (
    <MemoryToast
      key={key}
      kind={v.kind as "saved" | "updated" | "forgotten"}
      fact={String(v.fact)}
      onUndo={() => {}}
      onManage={() => {}}
    />
  );
}
