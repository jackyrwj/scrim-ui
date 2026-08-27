"use client";

import * as React from "react";
import { InlineCorrection } from "./inline-correction";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const ANSWER =
  "Chunk overlap should be set to 50% of the chunk size. This guarantees every sentence appears in two chunks and is always retrievable.";

const FIXED =
  "Chunk overlap is usually 10–20% of the chunk size. Past that it stops improving recall and starts inflating both your embedding bill and the number of near-duplicate passages the model has to read.";

export const inlineCorrectionControls: ComponentControls = {
  tag: "InlineCorrection",
  importFrom: "./inline-correction",
  controls: [
    { kind: "text", name: "text", label: "What the model said", value: ANSWER, multiline: true },
    { kind: "text", name: "correction", label: "Correction (empty = none yet)", value: "", multiline: true },
    { kind: "text", name: "correctedBy", label: "Corrected by", value: "" },
    { kind: "boolean", name: "revert", label: "Offer Withdraw", value: false },
  ],
  handlers: ["onSubmit"],
  remountOn: ["correction"],
  presets: [
    {
      id: "reading",
      title: "Uncorrected",
      note: "The resting state. Fix this appears on hover and on focus — hover-only would put the affordance out of reach of a keyboard and off a phone entirely.",
      values: { text: ANSWER, correction: "", correctedBy: "", revert: false },
    },
    {
      id: "corrected",
      title: "Corrected",
      note: "The original is still there, one click away. The pair is the training example; either half alone is close to worthless.",
      values: { text: ANSWER, correction: FIXED, correctedBy: "dana", revert: true },
    },
  ],
};

export function renderInlineCorrection(v: ControlValues, key: string) {
  const correction = String(v.correction).trim();
  return (
    <div key={key} className="max-w-lg">
      <InlineCorrection
        text={String(v.text)}
        correction={correction === "" ? undefined : String(v.correction)}
        correctedBy={String(v.correctedBy).trim() === "" ? undefined : String(v.correctedBy)}
        onRevert={v.revert ? () => {} : undefined}
      />
    </div>
  );
}
