"use client";

import { VoiceInput, type VoiceInputState } from "./voice-input";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const voiceInputControls: ComponentControls = {
  tag: "VoiceInput",
  importFrom: "./voice-input",
  controls: [
    {
      kind: "enum",
      name: "state",
      label: "State",
      value: "idle",
      options: [
        { value: "idle", label: "Idle" },
        { value: "recording", label: "Recording" },
      ],
    },
    { kind: "text", name: "recordingTime", label: "Elapsed", value: "0:07" },
    {
      kind: "text",
      name: "transcript",
      label: "Live transcript",
      value: "Show me the streaming message component with a tool call in the middle",
      multiline: true,
    },
  ],
  handlers: ["onStart", "onStop", "onCancel"],
  presets: [
    {
      id: "idle",
      title: "Idle",
      note: "A single microphone button; pressing it expands the control into recording.",
      values: { state: "idle" },
    },
    {
      id: "recording",
      title: "Recording",
      note: "Waveform, elapsed time, live transcript and Stop / Cancel — the red state is unmistakable.",
      values: { state: "recording" },
    },
  ],
  remountOn: ["state"],
};

export function renderVoiceInput(v: ControlValues, key: string) {
  return (
    <VoiceInput
      key={key}
      state={v.state as VoiceInputState}
      recordingTime={String(v.recordingTime)}
      transcript={String(v.transcript)}
      onStart={() => {}}
      onStop={() => {}}
      onCancel={() => {}}
    />
  );
}
