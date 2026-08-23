import { STAGE_HINTS, STAGE_LABELS, type VoiceMockupConfig } from "./types";

function jsString(value: string): string {
  return JSON.stringify(value);
}

export function generateCode(config: VoiceMockupConfig): string {
  const showLiveReply =
    config.stage === "thinking" ||
    config.stage === "speaking" ||
    config.stage === "interrupted";

  const turnsCode = config.turns
    .map(
      (turn) =>
        `  { id: ${jsString(turn.id)}, role: ${jsString(
          turn.role,
        )} as const, text: ${jsString(turn.text)}${
          turn.time ? `, time: ${jsString(turn.time)}` : ""
        }${turn.speaking ? ", speaking: true" : ""} }`,
    )
    .join(",\n");

  return `"use client";

import * as React from "react";
import { VoiceConversation } from "@/showcase/voice-conversation/voice-conversation";
import { VoiceWaveform } from "@/showcase/voice-waveform/voice-waveform";
import { VoiceInput } from "@/showcase/voice-input/voice-input";
import { StreamingMessage } from "@/showcase/streaming-message/streaming-message";

const TITLE = ${jsString(config.title)};
const SUBTITLE = ${jsString(config.subtitle)};
const STAGE: VoiceStage = ${jsString(config.stage)};
const ELAPSED_TIME = ${jsString(config.elapsedTime)};
const LIVE_TRANSCRIPT = ${jsString(config.liveTranscript)};
const ASSISTANT_REPLY = ${jsString(config.assistantReply)};
const SHOW_CONTROLS = ${config.showControls};

const TURNS = [
${turnsCode}
];

type VoiceStage = "idle" | "listening" | "thinking" | "speaking" | "interrupted";

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

function waveformState(stage: VoiceStage) {
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
    <span className={\`rounded-full px-2 py-0.5 text-[11px] font-medium \${cls}\`}>
      {${jsString(STAGE_LABELS[config.stage])}}
    </span>
  );
}

export function VoiceAssistantMockup() {
  const showLiveReply = ${showLiveReply};
  const hint = LIVE_TRANSCRIPT || ${jsString(STAGE_HINTS[config.stage])};

  return (
    <div className={${jsString(config.theme)} === "dark" ? "dark" : undefined}>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
              <MicIcon />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{TITLE}</p>
              {SUBTITLE && <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{SUBTITLE}</p>}
            </div>
          </div>
          <StatusChip stage={STAGE} />
        </div>

        {/* Live waveform strip */}
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <VoiceWaveform
            state={waveformState(STAGE)}
            bars={22}
            className="h-7 w-40 shrink-0 text-violet-500"
          />
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
        </div>

        {/* Conversation */}
        <div className="space-y-5 px-4 py-5 sm:px-6">
          <VoiceConversation turns={TURNS} />

          {showLiveReply && (
            <div className="flex items-start gap-3">
              <span className="mt-3 shrink-0 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-600 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-400">
                {${jsString(STAGE_LABELS[config.stage])}}
              </span>
              <div className="min-w-0 flex-1">
                <StreamingMessage
                  text={ASSISTANT_REPLY}
                  isStreaming={STAGE === "speaking"}
                  stopped={STAGE === "interrupted"}
                  speed={2}
                  showActions={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {SHOW_CONTROLS && (
          <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <VoiceInput
              state={STAGE === "listening" ? "recording" : "idle"}
              recordingTime={ELAPSED_TIME}
              transcript={LIVE_TRANSCRIPT}
            />
          </div>
        )}
      </div>
    </div>
  );
}
`;
}
