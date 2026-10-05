"use client";

import { Button } from "@/components/ui/button";
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
      <Button variant="outline" size="sm"
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
      >
        {playing ? "Pause" : "Replay conversation"}
      </Button>
      <VoiceConversation turns={rendered} />
    </div>
  );
}
