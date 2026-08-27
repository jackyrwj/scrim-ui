"use client";

import { VoiceCallControls } from "./voice-call-controls";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const voiceCallControlsControls: ComponentControls = {
  tag: "VoiceCallControls",
  importFrom: "./voice-call-controls",
  controls: [
    { kind: "boolean", name: "muted", label: "Muted", value: false },
    {
      kind: "number",
      name: "elapsedSeconds",
      label: "Elapsed (s)",
      value: 74,
      min: 0,
      max: 3600,
    },
  ],
  handlers: ["onToggleMute", "onEnd"],
  presets: [
    {
      id: "live",
      title: "Live call",
      note: "Mic open, clock running — the timer is the only persistent evidence the session is alive.",
      values: { muted: false },
    },
    {
      id: "muted",
      title: "Muted",
      note: "A slashed mic, a filled toggle, and the word 'Muted' — never an icon swap alone.",
      values: { muted: true, elapsedSeconds: 203 },
    },
  ],
};

export function renderVoiceCallControls(v: ControlValues, key: string) {
  return (
    <VoiceCallControls
      key={key}
      muted={Boolean(v.muted)}
      elapsedSeconds={Number(v.elapsedSeconds)}
      onToggleMute={() => {}}
      onEnd={() => {}}
    />
  );
}
