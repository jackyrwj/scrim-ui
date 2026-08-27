"use client";

import { ConfidenceAnswer } from "./confidence-answer";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const confidenceAnswerControls: ComponentControls = {
  tag: "ConfidenceAnswer",
  importFrom: "./confidence-answer",
  controls: [
    {
      kind: "enum",
      name: "confidence",
      label: "Confidence",
      value: "medium",
      options: [
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      kind: "text",
      name: "text",
      label: "Answer",
      value:
        "The library's `createStream` helper was deprecated in version 3.2 in favour of `streamText`, which takes the same options object.",
      multiline: true,
    },
    {
      kind: "text",
      name: "hedge",
      label: "What to double-check",
      value: "I may be off by a minor version — check the changelog for the exact release.",
      multiline: true,
    },
  ],
  presets: [
    {
      id: "medium",
      title: "Worth double-checking",
      note: "The common case: probably right, with the hedge naming the specific thing that might be off — a version, a date, a number.",
      values: {},
    },
    {
      id: "high",
      title: "High — no badge",
      note: "Certainty renders as a plain answer. A badge on every solid reply trains the eye to skip the badge row entirely.",
      values: {
        confidence: "high",
        text: "CSS Grid became supported across all major browsers in March 2017.",
        hedge: "",
      },
    },
    {
      id: "low",
      title: "Treat as a guess",
      note: "Red, and the hedge says what to do about it — verify before acting — not just that the answer is shaky.",
      values: {
        confidence: "low",
        text: "I believe the conference moved to a November slot, but I don't have a reliable record of it.",
        hedge:
          "This is reconstructed from an old announcement and may simply be wrong — verify on the event site before booking anything.",
      },
    },
  ],
};

export function renderConfidenceAnswer(v: ControlValues, key: string) {
  return (
    <ConfidenceAnswer
      key={key}
      confidence={v.confidence as "high" | "medium" | "low"}
      text={String(v.text)}
      hedge={v.hedge ? String(v.hedge) : undefined}
    />
  );
}
