"use client";

import { VoiceWaveform } from "./voice-waveform";

export function DemoStates() {
  return (
    <div className="space-y-4">
      <div>
        <VoiceWaveform state="idle" className="text-zinc-300 dark:text-zinc-600" />
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">Idle — nothing being captured</p>
      </div>
      <div>
        <VoiceWaveform state="listening" className="text-emerald-500" />
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">Listening — waiting for speech</p>
      </div>
      <div>
        <VoiceWaveform state="recording" className="text-red-500" />
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">Recording — capturing input</p>
      </div>
      <div>
        <VoiceWaveform state="speaking" className="text-violet-500" />
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">Speaking — the model is answering aloud</p>
      </div>
    </div>
  );
}

export function DemoHero() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-semibold">
        AI
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-600 dark:text-zinc-300">Assistant</span>
          <span>Speaking</span>
        </div>
        <VoiceWaveform state="speaking" className="mt-2 text-violet-500" bars={28} />
      </div>
    </div>
  );
}
