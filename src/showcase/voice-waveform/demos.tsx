"use client";

import { Card } from "@/components/ui/card";
import { VoiceWaveform } from "./voice-waveform";

export function DemoStates() {
  return (
    <div className="space-y-4">
      <div>
        <VoiceWaveform state="idle" className="text-muted-foreground" />
        <p className="mt-1.5 text-xs text-muted-foreground">Idle — nothing being captured</p>
      </div>
      <div>
        <VoiceWaveform state="listening" className="text-emerald-500" />
        <p className="mt-1.5 text-xs text-muted-foreground">Listening — waiting for speech</p>
      </div>
      <div>
        <VoiceWaveform state="recording" className="text-red-500" />
        <p className="mt-1.5 text-xs text-muted-foreground">Recording — capturing input</p>
      </div>
      <div>
        <VoiceWaveform state="speaking" className="text-muted-foreground" />
        <p className="mt-1.5 text-xs text-muted-foreground">Speaking — the model is answering aloud</p>
      </div>
    </div>
  );
}

export function DemoHero() {
  return (
    <Card className="flex-row gap-0 py-0 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
        AI
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-muted-foreground">Assistant</span>
          <span>Speaking</span>
        </div>
        <VoiceWaveform state="speaking" className="mt-2 text-muted-foreground" bars={28} />
      </div>
    </Card>
  );
}
