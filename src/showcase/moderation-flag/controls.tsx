"use client";

import { ModerationFlag } from "./moderation-flag";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const moderationFlagControls: ComponentControls = {
  tag: "ModerationFlag",
  importFrom: "./moderation-flag",
  controls: [
    {
      kind: "enum",
      name: "stage",
      label: "Where it fired",
      value: "output",
      options: [
        { value: "output", label: "Mid-response (output)" },
        { value: "input", label: "On the prompt (input)" },
      ],
    },
    {
      kind: "text",
      name: "stoppedText",
      label: "Kept partial (output)",
      value: "The first step is to identify the network's range, which you can do by —",
      multiline: true,
    },
    {
      kind: "text",
      name: "message",
      label: "Explanation",
      value:
        "The rest of this response was withheld because it may cross our usage policy. The partial answer above is kept so you can see where it stopped.",
      multiline: true,
    },
  ],
  handlers: ["onRetry", "onAppeal"],
  presets: [
    {
      id: "output",
      title: "Mid-response stop",
      note: "The stream was cut; the partial stays, dimmed and faded where it broke. Deleting words the reader already saw is gaslighting.",
      values: {},
    },
    {
      id: "input",
      title: "Prompt blocked",
      note: "Nothing was generated, so there is nothing to preserve — only the block and the way forward.",
      values: {
        stage: "input",
        stoppedText: "",
        message:
          "This prompt was flagged by the content filter and wasn't sent. Rephrasing often resolves false positives.",
      },
    },
  ],
};

export function renderModerationFlag(v: ControlValues, key: string) {
  return (
    <ModerationFlag
      key={key}
      stage={v.stage as "input" | "output"}
      stoppedText={v.stoppedText ? String(v.stoppedText) : undefined}
      message={String(v.message)}
      onRetry={() => {}}
      onAppeal={() => {}}
    />
  );
}
