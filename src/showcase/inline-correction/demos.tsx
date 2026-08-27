"use client";

import * as React from "react";
import { InlineCorrection } from "./inline-correction";

const ANSWER =
  "Chunk overlap should be set to 50% of the chunk size. This guarantees every sentence appears in two chunks and is always retrievable.";

const FIXED =
  "Chunk overlap is usually 10–20% of the chunk size. Past that it stops improving recall and starts inflating both your embedding bill and the number of near-duplicate passages the model has to read.";

export function DemoDefault() {
  const [correction, setCorrection] = React.useState<string | undefined>(undefined);
  return (
    <div className="max-w-lg">
      <InlineCorrection
        text={ANSWER}
        correction={correction}
        onSubmit={setCorrection}
        onRevert={() => setCorrection(undefined)}
      />
    </div>
  );
}

export function DemoReading() {
  return (
    <div className="max-w-lg">
      <InlineCorrection text={ANSWER} />
    </div>
  );
}

export function DemoCorrected() {
  return (
    <div className="max-w-lg">
      <InlineCorrection text={ANSWER} correction={FIXED} correctedBy="dana" onRevert={() => {}} />
    </div>
  );
}
