"use client";

import * as React from "react";
import { ReasoningLevel as ReasoningLevelControl, type ReasoningLevel } from "./reasoning-level";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const reasoningLevelControls: ComponentControls = {
  tag: "ReasoningLevel",
  importFrom: "./reasoning-level",
  controls: [
    {
      kind: "enum",
      name: "value",
      label: "Level",
      value: "balanced",
      options: [
        { value: "light", label: "Light" },
        { value: "balanced", label: "Balanced" },
        { value: "deep", label: "Deep" },
      ],
    },
    { kind: "boolean", name: "compact", label: "Compact", value: false },
  ],
  handlers: ["onChange"],
  presets: [
    {
      id: "balanced",
      title: "Balanced",
      note: "A segmented control with a live caption explaining the current choice.",
      values: { value: "balanced", compact: false },
    },
    {
      id: "deep",
      title: "Deep",
      note: "Deep reasoning is for hard problems — the exception, not the default.",
      values: { value: "deep", compact: false },
    },
    {
      id: "compact",
      title: "Compact",
      note: "Drops the caption for popovers and side panels where vertical space is scarce.",
      values: { value: "balanced", compact: true },
    },
  ],
};

/* Seeded from the controls and then owned locally, so the preview responds to
   clicks. Re-seeding is done by remounting on a key that includes the seed —
   the React way to reset state when an input changes — rather than a
   setState inside an effect. */
function LiveReasoningLevel({ v }: { v: ControlValues }) {
  const [level, setLevel] = React.useState<ReasoningLevel>(v.value as ReasoningLevel);
  return (
    <ReasoningLevelControl value={level} compact={Boolean(v.compact)} onChange={setLevel} />
  );
}

export function renderReasoningLevel(v: ControlValues, key: string) {
  return <LiveReasoningLevel key={`${key}:${v.value}`} v={v} />;
}
