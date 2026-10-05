"use client";

import { Button } from "@/components/ui/button";
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
      <div className="rounded-xl border border-border bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
        Call ended · {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
        <Button variant="ghost" size="sm"
          type="button"
          onClick={() => { setEnded(false); setElapsed(0); setMuted(false); }}
          className="ml-2 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Restart demo
        </Button>
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
