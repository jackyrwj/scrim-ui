"use client";

import { StreamingMessage } from "./streaming-message";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const TEXT =
  "Streaming delivers tokens incrementally, so the reader sees partial output while the model is still writing. That changes two things: perceived latency drops sharply, and the interface has to hold a half-finished state that is still legible.";

export const streamingMessageControls: ComponentControls = {
  tag: "StreamingMessage",
  importFrom: "./streaming-message",
  controls: [
    { kind: "text", name: "text", label: "Text", value: TEXT, multiline: true },
    { kind: "boolean", name: "isStreaming", label: "Streaming", value: true },
    { kind: "boolean", name: "stopped", label: "Stopped", value: false },
    { kind: "number", name: "speed", label: "Tokens / sec", value: 40, min: 5, max: 120, step: 5 },
    { kind: "boolean", name: "showActions", label: "Show actions", value: true },
  ],
  handlers: ["onStop", "onRegenerate", "onComplete"],
  presets: [
    {
      id: "streaming",
      title: "Streaming",
      note: "Token-by-token reveal with a blinking caret and a Stop control.",
      values: { isStreaming: true, stopped: false, showActions: true },
    },
    {
      id: "complete",
      title: "Complete",
      note: "Streaming affordances disappear and the reply settles into its final form.",
      values: { isStreaming: false, stopped: false, showActions: true },
    },
    {
      id: "stopped",
      title: "Stopped",
      note: "Interrupting freezes the partial text and labels it — nothing is silently lost.",
      values: { isStreaming: false, stopped: true, showActions: true },
    },
  ],
  remountOn: ["isStreaming", "stopped", "speed", "text"],
};

export function renderStreamingMessage(v: ControlValues, key: string) {
  return (
    <StreamingMessage
      key={key}
      text={String(v.text)}
      isStreaming={Boolean(v.isStreaming)}
      stopped={Boolean(v.stopped)}
      speed={Number(v.speed)}
      showActions={Boolean(v.showActions)}
      onStop={() => {}}
      onRegenerate={() => {}}
    />
  );
}
