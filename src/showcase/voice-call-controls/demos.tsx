"use client";

import * as React from "react";
import { VoiceCallControls } from "./voice-call-controls";

export function DemoVoiceCall() {
  const [muted, setMuted] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(74);
  const [ended, setEnded] = React.useState(false);

  React.useEffect(() => {
    if (ended) return;
    const t = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [ended]);

  if (ended) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Call ended · {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
        <button
          type="button"
          onClick={() => { setEnded(false); setElapsed(0); setMuted(false); }}
          className="ml-2 text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Restart demo
        </button>
      </div>
    );
  }

  return (
    <VoiceCallControls
      muted={muted}
      onToggleMute={() => setMuted((m) => !m)}
      elapsedSeconds={elapsed}
      onEnd={() => setEnded(true)}
    />
  );
}

export function DemoVoiceCallMuted() {
  return <VoiceCallControls muted elapsedSeconds={203} onToggleMute={() => {}} onEnd={() => {}} />;
}
