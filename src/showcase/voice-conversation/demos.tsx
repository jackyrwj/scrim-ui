"use client";

import * as React from "react";
import { VoiceConversation, type VoiceTurn } from "./voice-conversation";

const turns: VoiceTurn[] = [
  { id: "1", role: "user", text: "Book a flight to Tokyo next Friday morning.", time: "0:03" },
  {
    id: "2",
    role: "assistant",
    text: "Got it. I see a direct option leaving at 8:40 AM with one checked bag included. Shall I book it?",
    time: "0:08",
  },
  { id: "3", role: "user", text: "Yes, and add a window seat.", time: "0:11" },
];

export function DemoConversation() {
  return (
    <VoiceConversation
      turns={turns.map((t, i) => ({ ...t, speaking: i === 1 }))}
      onReplay={() => {
        /* replay re-emits the audio for that turn */
      }}
    />
  );
}

export function DemoPlaying() {
  const [idx, setIdx] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % turns.length), 1300);
    return () => window.clearInterval(id);
  }, [playing]);

  const rendered = turns.map((t, i) => ({ ...t, speaking: playing && i === idx }));

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {playing ? "Pause" : "Replay conversation"}
      </button>
      <VoiceConversation turns={rendered} />
    </div>
  );
}
