"use client";

import * as React from "react";
import { VoiceConversation } from "@/showcase/voice-conversation/voice-conversation";
import {
  VoiceWaveform,
  type WaveformState,
} from "@/showcase/voice-waveform/voice-waveform";
import { VoiceInput } from "@/showcase/voice-input/voice-input";
import { StreamingMessage } from "@/showcase/streaming-message/streaming-message";
import { DEVICE_WIDTHS } from "../device-presets";
import {
  STAGE_HINTS,
  STAGE_LABELS,
  type VoiceMockupConfig,
  type VoiceStage,
} from "./types";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="15"
      height="15"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function waveformState(stage: VoiceStage): WaveformState {
  switch (stage) {
    case "listening":
      return "listening";
    case "speaking":
      return "speaking";
    case "thinking":
    case "interrupted":
    case "idle":
    default:
      return "idle";
  }
}

function StatusChip({ stage }: { stage: VoiceStage }) {
  let cls = "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  if (stage === "listening" || stage === "speaking") {
    cls = "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300";
  } else if (stage === "thinking") {
    cls = "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  } else if (stage === "interrupted") {
    cls = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* VoiceMockupPreview                                                  */
/* ------------------------------------------------------------------ */

export function VoiceMockupPreview({ config }: { config: VoiceMockupConfig }) {
  const showLiveReply =
    config.stage === "thinking" ||
    config.stage === "speaking" ||
    config.stage === "interrupted";

  const hint = config.liveTranscript || STAGE_HINTS[config.stage];

  return (
    <div className={config.theme === "dark" ? "dark" : undefined}>
      <div
        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        style={{ width: DEVICE_WIDTHS[config.device], maxWidth: "100%" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
              <MicIcon />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {config.title}
              </p>
              {config.subtitle && (
                <p className="truncate text-xs text-zinc-400">{config.subtitle}</p>
              )}
            </div>
          </div>
          <StatusChip stage={config.stage} />
        </div>

        {/* Live waveform strip */}
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <VoiceWaveform
            state={waveformState(config.stage)}
            bars={22}
            className="h-7 w-40 shrink-0 text-violet-500"
          />
          <p className="truncate text-xs text-zinc-400">{hint}</p>
        </div>

        {/* Conversation */}
        <div className="space-y-5 px-4 py-5 sm:px-6">
          <VoiceConversation turns={config.turns} />

          {showLiveReply && (
            <div className="flex items-start gap-3">
              <span className="mt-3 shrink-0 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-600 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-400">
                {STAGE_LABELS[config.stage]}
              </span>
              <div className="min-w-0 flex-1">
                <StreamingMessage
                  text={config.assistantReply}
                  isStreaming={config.stage === "speaking"}
                  stopped={config.stage === "interrupted"}
                  speed={2}
                  showActions={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {config.showControls && (
          <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <VoiceInput
              state={config.stage === "listening" ? "recording" : "idle"}
              recordingTime={config.elapsedTime}
              transcript={config.liveTranscript}
            />
          </div>
        )}
      </div>
    </div>
  );
}
