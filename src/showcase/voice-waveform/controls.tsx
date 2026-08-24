"use client";

import { VoiceWaveform, type WaveformState } from "./voice-waveform";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const voiceWaveformControls: ComponentControls = {
  tag: "VoiceWaveform",
  importFrom: "./voice-waveform",
  controls: [
    {
      kind: "enum",
      name: "state",
      label: "State",
      value: "listening",
      options: [
        { value: "idle", label: "Idle" },
        { value: "listening", label: "Listening" },
        { value: "recording", label: "Recording" },
        { value: "speaking", label: "Speaking" },
      ],
    },
    { kind: "number", name: "bars", label: "Bars", value: 24, min: 6, max: 48 },
  ],
  presets: [
    {
      id: "idle",
      title: "Idle",
      note: "Flat and dim — nothing is happening, and the UI says so honestly.",
      values: { state: "idle", bars: 24 },
    },
    {
      id: "listening",
      title: "Listening",
      note: "Gentle motion while the mic is open but nobody is talking yet.",
      values: { state: "listening", bars: 24 },
    },
    {
      id: "recording",
      title: "Recording",
      note: "The loudest state — the user is speaking and the bars respond.",
      values: { state: "recording", bars: 32 },
    },
    {
      id: "speaking",
      title: "Speaking",
      note: "The assistant's turn. A different rhythm from recording keeps the two apart.",
      values: { state: "speaking", bars: 24 },
    },
  ],
  remountOn: ["state", "bars"],
};

export function renderVoiceWaveform(v: ControlValues, key: string) {
  return (
    <div key={key} className="flex justify-center text-violet-600 dark:text-violet-400">
      <VoiceWaveform state={v.state as WaveformState} bars={Number(v.bars)} className="h-10 w-64" />
    </div>
  );
}
