"use client";

import * as React from "react";
import { VoiceInput } from "../../voice-input/voice-input";
import { VoiceWaveform, type WaveformState } from "../../voice-waveform/voice-waveform";
import { VoiceConversation, type VoiceTurn } from "../../voice-conversation/voice-conversation";
import { StreamingMessage } from "../../streaming-message/streaming-message";
import { PromptInput } from "../../prompt-input/prompt-input";

/* ------------------------------------------------------------------ */
/* Copy / data                                                         */
/* ------------------------------------------------------------------ */

type Stage = "idle" | "listening" | "recording";

const SPOKEN =
  "What does streaming versus waiting for the full reply do for perceived latency?";
const SPOKEN_WORDS = SPOKEN.split(" ");

const REPLIES = [
  "Streaming lands the first token in milliseconds, which makes a reply feel instant. Keep the reveal smooth, offer a stop control, and only surface citations once the claim is actually grounded.",
  "A voice-first interface should mirror its state out loud: listening, recording, speaking. The waveform is the visual echo of what the assistant is doing right now.",
];

const STAGE_TEXT: Record<Stage, string> = {
  idle: "Tap the mic to start talking",
  listening: "Listening…",
  recording: "Recording — tap stop when you are done",
};

const SPEAKING_TEXT = "Speaking…";

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

function waveState(stage: Stage, streaming: boolean): WaveformState {
  if (streaming) return "speaking";
  if (stage === "recording") return "recording";
  if (stage === "listening") return "listening";
  return "idle";
}

function stageText(stage: Stage, streaming: boolean) {
  return streaming ? SPEAKING_TEXT : STAGE_TEXT[stage];
}

function StatusChip({ stage, streaming }: { stage: Stage; streaming: boolean }) {
  let label = "Idle";
  let cls = "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  if (streaming) {
    label = "Speaking";
    cls = "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300";
  } else if (stage === "recording") {
    label = "Recording";
    cls = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  } else if (stage === "listening") {
    label = "Listening";
    cls = "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300";
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>
  );
}

/* ------------------------------------------------------------------ */
/* VoiceAssistantPattern                                               */
/* ------------------------------------------------------------------ */

export function VoiceAssistantPattern() {
  const [turns, setTurns] = React.useState<VoiceTurn[]>([
    {
      id: "1",
      role: "assistant",
      text: "Hi, I’m your voice assistant. Tap the mic and talk, or type below — I’ll answer out loud.",
      time: "Now",
    },
  ]);
  const [stage, setStage] = React.useState<Stage>("idle");
  const [transcript, setTranscript] = React.useState("");
  const [reply, setReply] = React.useState<string | null>(null);
  const [streaming, setStreaming] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const idRef = React.useRef(2);
  const replyRef = React.useRef(0);
  const wordRef = React.useRef(0);
  const typingRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, reply, stage]);

  const recordingTime = `0:0${Math.min(3 + Math.ceil(transcript.length / 14), 9)}`;

  function clearTyping() {
    if (typingRef.current !== null) {
      window.clearInterval(typingRef.current);
      typingRef.current = null;
    }
  }

  function startListening() {
    if (streaming) {
      setReply(null);
      setStreaming(false);
    }
    clearTyping();
    setTranscript("");
    setStage("listening");
    window.setTimeout(() => {
      setStage("recording");
      wordRef.current = 0;
      typingRef.current = window.setInterval(() => {
        wordRef.current += 1;
        setTranscript(SPOKEN_WORDS.slice(0, wordRef.current).join(" "));
        if (wordRef.current >= SPOKEN_WORDS.length) clearTyping();
      }, 230);
    }, 900);
  }

  function cancelRecording() {
    clearTyping();
    setTranscript("");
    setStage("idle");
  }

  function stopRecording() {
    clearTyping();
    const text = transcript.trim();
    setTranscript("");
    if (!text) {
      setStage("idle");
      return;
    }
    setStage("idle");
    setTurns((t) => [...t, { id: String(idRef.current++), role: "user", text, time: recordingTime }]);
    beginReply();
  }

  function beginReply() {
    const text = REPLIES[replyRef.current % REPLIES.length];
    replyRef.current += 1;
    setReply(text);
    setStreaming(true);
  }

  function finishReply() {
    if (reply) {
      setTurns((t) => [
        ...t,
        { id: String(idRef.current++), role: "assistant", text: reply, time: "Now" },
      ]);
    }
    setReply(null);
    setStreaming(false);
  }

  function stopReply() {
    setReply(null);
    setStreaming(false);
  }

  function submitText(value: string) {
    setTurns((t) => [...t, { id: String(idRef.current++), role: "user", text: value, time: "Now" }]);
    beginReply();
  }

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
            <MicIcon />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Voice Assistant
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Hands-free answers</p>
          </div>
        </div>
        <StatusChip stage={stage} streaming={streaming} />
      </div>

      {/* Live waveform strip */}
      <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <VoiceWaveform
          state={waveState(stage, streaming)}
          bars={22}
          className="h-7 w-40 shrink-0 text-violet-500"
        />
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{stageText(stage, streaming)}</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
        <VoiceConversation turns={turns} />

        {reply && (
          <div className="flex items-start gap-3">
            <span className="mt-3 shrink-0 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-600 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-400">
              Speaking
            </span>
            <div className="min-w-0 flex-1">
              <StreamingMessage
                text={reply}
                isStreaming={streaming}
                speed={2}
                showActions={false}
                onStop={stopReply}
                onComplete={finishReply}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <VoiceInput
          state={stage === "recording" ? "recording" : "idle"}
          recordingTime={recordingTime}
          transcript={transcript}
          onStart={startListening}
          onStop={stopRecording}
          onCancel={cancelRecording}
        />
        <PromptInput
          placeholder="Type instead…"
          onSubmit={submitText}
          showWebSearch={false}
          showTools={false}
          disabled={streaming}
        />
      </div>
    </div>
  );
}
