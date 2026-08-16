"use client";

import * as React from "react";
import { VoiceInput, type VoiceInputState } from "./voice-input";

export function DemoIdle() {
  const [state, setState] = React.useState<VoiceInputState>("idle");
  return (
    <VoiceInput
      state={state}
      onStart={() => setState("recording")}
      onStop={() => setState("idle")}
      onCancel={() => setState("idle")}
    />
  );
}

export function DemoRecording() {
  return (
    <VoiceInput
      state="recording"
      recordingTime="0:12"
      transcript="We should increase the batch size to reduce latency…"
      onCancel={() => {
        /* cancel returns to idle in a real app */
      }}
    />
  );
}
