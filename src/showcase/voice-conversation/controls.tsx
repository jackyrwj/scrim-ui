"use client";

import { VoiceConversation } from "./voice-conversation";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** `role | text | time` per line. */
const TURNS = [
  "user | Show me the streaming message component with a tool call in the middle | 0:02",
  "assistant | Here it is — the tool row appears inline, then streaming resumes underneath. | 0:04",
  "user | Can the tool row collapse once it finishes? | 0:11",
  "assistant | Yes. Keep it open while running, collapse on success, stay open on error. | 0:13",
].join("\n");

function parse(text: string, speakingIndex: number) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [role, body, time] = line.split("|").map((p) => p.trim());
      return {
        id: `t${i + 1}`,
        role: (role === "user" ? "user" : "assistant") as "user" | "assistant",
        text: body,
        time,
        speaking: i === speakingIndex,
      };
    });
}

export const voiceConversationControls: ComponentControls = {
  tag: "VoiceConversation",
  importFrom: "./voice-conversation",
  controls: [
    { kind: "text", name: "turns", label: "Turns (role | text | time)", value: TURNS, multiline: true },
    { kind: "number", name: "speaking", label: "Speaking turn (-1 for none)", value: -1, min: -1, max: 7 },
  ],
  handlers: ["onReplay"],
  derive: (v) => {
    const body = parse(String(v.turns), Number(v.speaking))
      .map(
        (t) =>
          `  { id: ${JSON.stringify(t.id)}, role: ${JSON.stringify(t.role)}, text: ${JSON.stringify(t.text)}, time: ${JSON.stringify(t.time ?? "")}${t.speaking ? ", speaking: true" : ""} },`,
      )
      .join("\n");
    return { preamble: `const TURNS = [\n${body}\n];`, props: { turns: "TURNS" } };
  },
  presets: [
    {
      id: "conversation",
      title: "Transcript",
      note: "Alternating turns with timestamps and a replay control on each.",
      values: { turns: TURNS, speaking: -1 },
    },
    {
      id: "playing",
      title: "Speaking",
      note: "The speaking turn carries a live indicator, so it is obvious which one you hear.",
      values: { turns: TURNS, speaking: 3 },
    },
  ],
};

export function renderVoiceConversation(v: ControlValues, key: string) {
  return (
    <VoiceConversation
      key={key}
      turns={parse(String(v.turns), Number(v.speaking))}
      onReplay={() => {}}
    />
  );
}
