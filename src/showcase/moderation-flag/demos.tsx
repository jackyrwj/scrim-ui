"use client";

import * as React from "react";
import { ModerationFlag } from "./moderation-flag";

export function DemoModeration() {
  const [resetKey, setResetKey] = React.useState(0);
  return (
    <ModerationFlag
      key={resetKey}
      stage="output"
      stoppedText="The first step is to identify the network's range, which you can do by —"
      message="The rest of this response was withheld because it may cross our usage policy. The partial answer above is kept so you can see where it stopped."
      onRetry={() => setResetKey((k) => k + 1)}
      onAppeal={() => {}}
    />
  );
}

export function DemoModerationInput() {
  return (
    <ModerationFlag
      stage="input"
      message="This prompt was flagged by the content filter and wasn't sent. Rephrasing often resolves false positives."
      onRetry={() => {}}
      onAppeal={() => {}}
    />
  );
}
