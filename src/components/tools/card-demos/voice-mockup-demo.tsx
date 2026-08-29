"use client";

import * as React from "react";
import { VoiceMockupPreview } from "../voice-mockup/voice-mockup-preview";
import type { VoiceMockupConfig, VoiceStage } from "../voice-mockup/types";
import { sliceTo, useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The Voice Assistant Mockup Generator, replaying a full voice turn in a
 * card: the user talks (live transcript + waveform), the assistant thinks,
 * then the reply streams in — and gets cut off once, because "interrupted"
 * is one of the stages the tool sells.
 *
 * The screen is the tool's own preview component; the transcript and the
 * clock are the same fields the editor exposes.
 */

const QUESTION = "What makes a voice interface feel responsive?";

const REPLY =
  "A responsive voice UI acknowledges instantly, shows a live waveform while you talk, and streams the answer so there's no dead air — with a stop control always in reach.";

const GREETING: VoiceMockupConfig["turns"] = [
  {
    id: "g1",
    role: "assistant",
    text: "Hi, I'm your voice assistant. Tap the mic and talk — I'll answer out loud.",
    time: "Now",
  },
];

/* listening → thinking → speaking → interrupted, then the turn restarts. */
const LISTEN_MS = 3600;
const THINK_MS = 1400;
const SPEAK_MS = 1900;
const LOOP_MS = LISTEN_MS + THINK_MS + SPEAK_MS + 1300;

const TRANSCRIPT_TYPE_MS = 3000;

function stageAt(elapsed: number): VoiceStage {
  if (elapsed < LISTEN_MS) return "listening";
  if (elapsed < LISTEN_MS + THINK_MS) return "thinking";
  if (elapsed < LISTEN_MS + THINK_MS + SPEAK_MS) return "speaking";
  return "interrupted";
}

function configFor(
  stage: VoiceStage,
  transcript: string,
  seconds: number,
  loop: number,
): VoiceMockupConfig {
  const answered = stage !== "listening";
  return {
    title: "Voice Assistant",
    subtitle: "Hands-free answers",
    device: "mobile",
    theme: loop % 2 === 0 ? "light" : "dark",
    stage,
    liveTranscript: stage === "listening" ? transcript : "",
    elapsedTime: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
    assistantReply: answered ? REPLY : "",
    showControls: true,
    turns: answered
      ? [...GREETING, { id: "u1", role: "user" as const, text: QUESTION, time: "0:03" }]
      : GREETING,
  };
}

export function VoiceMockupDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  /* Primitive states only: each one changes rarely (word boundaries, once
     a second, four stage flips a loop), and React bails out of re-rendering
     when every setState receives the same value — so the animated preview
     repaints only when something on screen actually moved. */
  const [transcript, setTranscript] = React.useState("");
  const [seconds, setSeconds] = React.useState(0);
  const [stage, setStage] = React.useState<VoiceStage>("listening");
  const [loop, setLoop] = React.useState(0);

  React.useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      const total = performance.now() - started;
      const elapsed = total % LOOP_MS;
      setTranscript(sliceTo(QUESTION, Math.min(1, elapsed / TRANSCRIPT_TYPE_MS)));
      setSeconds(Math.floor(elapsed / 1000));
      setStage(stageAt(elapsed));
      setLoop(Math.floor(total / LOOP_MS));
    }, 250);
    return () => window.clearInterval(id);
  }, [playing]);

  const config = React.useMemo(
    () =>
      reduced
        ? configFor("interrupted", QUESTION, 3, 0)
        : configFor(stage, transcript, seconds, loop),
    [reduced, stage, transcript, seconds, loop],
  );

  return (
    <div ref={frameRef} className="flex h-full items-center justify-center">
      <VoiceMockupPreview config={config} />
    </div>
  );
}
