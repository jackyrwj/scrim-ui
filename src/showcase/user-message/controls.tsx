"use client";

import { UserMessage } from "./user-message";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const DEFAULT_TEXT =
  "Give me a table comparing the three streaming approaches — time to first token, perceived latency and implementation cost.";

const LONG_TEXT =
  "Walk through the full flow: user sends a prompt, the model streams a draft, the draft includes a tool call to fetch sources, the tool returns, and the final answer cites those sources inline. Then show me where each of those transitions should live in the UI — which states are worth animating and which should just swap instantly.";

export const userMessageControls: ComponentControls = {
  tag: "UserMessage",
  importFrom: "./user-message",
  controls: [
    { kind: "text", name: "text", label: "Message", value: DEFAULT_TEXT, multiline: true },
    { kind: "boolean", name: "edited", label: "Edited chip", value: false },
    { kind: "boolean", name: "showActions", label: "Show actions", value: true },
  ],
  handlers: ["onCopy", "onEdit", "onRegenerate"],
  presets: [
    {
      id: "default",
      title: "Default",
      note: "Right-aligned bubble with the full action row.",
      values: { text: DEFAULT_TEXT, edited: false, showActions: true },
    },
    {
      id: "edited",
      title: "Edited",
      note: "The chip tells the model and other readers the prompt was revised.",
      values: { text: DEFAULT_TEXT, edited: true, showActions: true },
    },
    {
      id: "long",
      title: "Long prompt",
      note: "Long text wraps inside the bubble; actions stay with the message.",
      values: { text: LONG_TEXT, edited: false, showActions: true },
    },
    {
      id: "bare",
      title: "No actions",
      note: "Drop the action row for read-only transcripts.",
      values: { text: DEFAULT_TEXT, edited: false, showActions: false },
    },
  ],
};

export function renderUserMessage(v: ControlValues, key: string) {
  return (
    <UserMessage
      key={key}
      text={String(v.text)}
      edited={Boolean(v.edited)}
      showActions={Boolean(v.showActions)}
      onCopy={() => {}}
      onEdit={() => {}}
      onRegenerate={() => {}}
    />
  );
}
