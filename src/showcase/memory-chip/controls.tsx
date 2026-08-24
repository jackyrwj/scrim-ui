"use client";

import { MemoryChip } from "./memory-chip";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const memoryChipControls: ComponentControls = {
  tag: "MemoryChip",
  importFrom: "./memory-chip",
  controls: [
    {
      kind: "enum",
      name: "variant",
      label: "Variant",
      value: "saved",
      options: [
        { value: "saved", label: "Saved confirmation" },
        { value: "on", label: "Status indicator" },
      ],
    },
    { kind: "text", name: "label", label: "Label override", value: "" },
  ],
  handlers: ["onClick"],
  presets: [
    {
      id: "saved",
      title: "Saved",
      note: "Confirms a memory was stored, right where the assistant used it.",
      values: { variant: "saved", label: "" },
    },
    {
      id: "on",
      title: "Status",
      note: "A quiet, always-visible signal that memory is active and how full it is.",
      values: { variant: "on", label: "Memory on · 3 items" },
    },
  ],
};

export function renderMemoryChip(v: ControlValues, key: string) {
  return (
    <div key={key} className="flex justify-center">
      <MemoryChip
        variant={v.variant as "saved" | "on"}
        label={v.label ? String(v.label) : undefined}
        onClick={() => {}}
      />
    </div>
  );
}
