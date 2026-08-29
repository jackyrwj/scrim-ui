"use client";

import * as React from "react";
import { VoiceInput } from "@/showcase/voice-input/voice-input";
import { VoiceWaveform, type WaveformState } from "@/showcase/voice-waveform/voice-waveform";
import { VoiceConversation, type VoiceTurn } from "@/showcase/voice-conversation/voice-conversation";
import { VoiceCallControls } from "@/showcase/voice-call-controls/voice-call-controls";
import { sliceTo, useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The Voice Assistant template, playing one call — including the part where
 * the caller talks over it.
 *
 * Every voice UI can render a waveform and a transcript; that is the demo
 * this page could have been, and it would have sold the wrong thing. The
 * template's reason to exist is barge-in: the assistant is mid-sentence, the
 * caller starts talking, playback is truncated at the millisecond the mic
 * opened, and the conversation continues from what was actually said — not
 * from what was queued. So the script is built around that beat:
 *
 *   1. The session opens and listens. The waveform is live the whole call —
 *      it shows whoever owns the floor, mic or remote track, which is the
 *      only honest answer a voice UI can give to "is this thing on?".
 *   2. The caller asks something; the assistant starts answering.
 *   3. Mid-answer, the caller cuts in. The assistant's bubble snaps back to
 *      the words that were actually played and keeps an "— interrupted"
 *      marker, because a transcript that shows unsaid words as said is a
 *      lie the next turn will trip over. The retraction is the point of the
 *      demo; watch the bubble at that moment.
 *   4. The assistant answers the interruption. The call stays open.
 *
 * What renders below is the real session chrome the template ships — the
 * waveform, the conversation, the push-to-talk surface, the call controls —
 * mounted from src/showcase. What it is not is a microphone: no audio
 * capture, no WebRTC, no session route behind the frame, and the "call" is a
 * script. That is stated under the frame rather than left for someone to
 * discover.
 */

/* One exchange, scripted. The assistant's first answer exists in two forms:
   what it was going to say, and how much of that the caller actually heard
   before cutting in. The gap between them is the barge-in. */
const USER_Q = "Move my three o'clock with Priya to tomorrow morning.";
const ASSISTANT_FULL =
  "Done — moved to tomorrow at 9am, same link, and I've asked Priya to confirm the new time.";
const ASSISTANT_PLAYED = "Done — moved to tomorrow at 9am, same link,";
const USER_BARGE = "Wait — make it 10:30, Ben's joining.";
const ASSISTANT_B =
  "10:30 tomorrow with Priya and Ben. Standup runs to 10:15, so you've got a buffer — the invite is updated and Ben has been added.";

/* The call, as a sequence of screens. Durations are the pacing of the replay,
   not of a real session: long enough to read what changed, short enough that
   the loop comes back around while someone is still on the page. */
type Phase =
  | "idle"
  | "listening"
  | "userSpeaking"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "interjecting"
  | "replying"
  | "done";

const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "idle", ms: 1000 },
  { phase: "listening", ms: 1500 },
  { phase: "userSpeaking", ms: 2800 },
  { phase: "thinking", ms: 1000 },
  { phase: "speaking", ms: 3000 },
  { phase: "interrupted", ms: 1600 },
  { phase: "interjecting", ms: 2600 },
  { phase: "replying", ms: 3400 },
  { phase: "done", ms: 5200 },
];

const ORDER: Phase[] = TIMELINE.map((t) => t.phase);
const at = (phase: Phase, min: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(min);

/* The phases where text is arriving. The caller's words stream into the
   push-to-talk surface; the assistant's stream into its bubble. */
const STREAMING: Phase[] = ["userSpeaking", "speaking", "interjecting", "replying"];

/** What the session store would call this screen — the chrome pill and the
 *  header pill both read from here rather than guessing. */
function stateFor(phase: Phase): "idle" | "listening" | "thinking" | "speaking" | "interrupted" {
  if (phase === "thinking") return "thinking";
  if (phase === "speaking" || phase === "replying") return "speaking";
  if (phase === "interrupted") return "interrupted";
  if (phase === "idle") return "idle";
  return "listening";
}

/** The waveform shows whoever owns the floor. */
function waveformFor(phase: Phase): WaveformState {
  if (phase === "userSpeaking" || phase === "interrupted" || phase === "interjecting")
    return "recording";
  if (phase === "speaking" || phase === "replying") return "speaking";
  if (phase === "idle") return "idle";
  return "listening";
}

const STATE_LABEL: Record<ReturnType<typeof stateFor>, string> = {
  idle: "Off",
  listening: "Listening",
  thinking: "Thinking…",
  speaking: "Speaking",
  interrupted: "Interrupted",
};

const STATE_HINT: Partial<Record<Phase, string>> = {
  listening: "Just start talking.",
  speaking: "Talk over it — that is the demo.",
  interrupted: "You cut in. Finish your thought.",
};

export function VoiceAssistantDemo({ caption = true }: { caption?: boolean }) {
  const [step, setStep] = React.useState(0);
  /* Tagged with the step it belongs to, so moving on resets the reveal
     without an effect having to zero it. */
  const [progress, setProgress] = React.useState({ step: 0, value: 0 });
  /* The call clock. A voice call has no scrollback; the elapsed timer is the
     persistent evidence the session is alive. */
  const [elapsed, setElapsed] = React.useState(0);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  /* Reduced motion gets the finished call and nothing moving: the point of
     the frame is what the app looks like, and that survives being still. */
  const phase = reduced ? "done" : TIMELINE[step].phase;
  const ratio = progress.step === step ? progress.value : 0;
  const state = stateFor(phase);
  const active = phase !== "idle";

  const playing = inView && !reduced;

  /* The step machine. One timeout per screen, cleared on every change, so
     scrolling away mid-call cannot leave a stray timer behind. The clock
     zeroes here, on the wrap back to idle, rather than in an effect body —
     a synchronous setState in an effect is a cascading render. */
  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => {
      const next = (step + 1) % TIMELINE.length;
      if (TIMELINE[next].phase === "idle") setElapsed(0);
      setStep(next);
    }, TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  /* The reveal for whichever text this screen is streaming. Driven off elapsed
     time rather than a per-character timer: a tab that was backgrounded
     resumes at the right place instead of finishing a burst of queued ticks. */
  React.useEffect(() => {
    if (!playing || !STREAMING.includes(phase)) return;
    const total = TIMELINE[step].ms;
    const started = performance.now();
    const id = window.setInterval(() => {
      setProgress({ step, value: Math.min(1, (performance.now() - started) / total) });
    }, 40);
    return () => window.clearInterval(id);
  }, [step, phase, playing]);

  /* The clock ticks while the call is open. It zeroes on the wrap back to
     idle (in the step machine above) and on replay — never in an effect. */
  React.useEffect(() => {
    if (!playing || phase === "idle") return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase, playing]);

  /* Follow the transcript down as it grows, exactly as the template's
     Transcript does. */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [phase, ratio]);

  function replay() {
    setProgress({ step: 0, value: 0 });
    setElapsed(0);
    setStep(0);
  }

  /* The transcript, built up the way the session store builds it: the
     caller's words land as a turn only when they finish speaking; while they
     talk, the words live in the push-to-talk surface below. The interrupted
     answer keeps only what was played, with the marker that makes the next
     turn make sense. */
  const turns: VoiceTurn[] = [];
  if (at(phase, "thinking")) {
    turns.push({ id: "u1", role: "user", text: USER_Q, time: "0:04" });
  }
  if (at(phase, "speaking")) {
    const retracted = at(phase, "interrupted");
    turns.push({
      id: "a1",
      role: "assistant",
      text: retracted ? ASSISTANT_PLAYED : sliceTo(ASSISTANT_FULL, ratio),
      time: retracted ? "— interrupted" : "0:08",
      speaking: phase === "speaking",
    });
  }
  if (at(phase, "replying")) {
    turns.push({ id: "u2", role: "user", text: USER_BARGE, time: "0:15" });
    turns.push({
      id: "a2",
      role: "assistant",
      text: sliceTo(ASSISTANT_B, ratio),
      time: "0:19",
      speaking: phase === "replying",
    });
  }

  const recording = phase === "userSpeaking" || phase === "interrupted" || phase === "interjecting";
  const recordingText =
    phase === "userSpeaking"
      ? sliceTo(USER_Q, ratio)
      : phase === "interjecting"
        ? sliceTo(USER_BARGE, ratio)
        : "";
  const recordingTime = `0:${String(Math.floor((ratio * TIMELINE[step].ms) / 1000)).padStart(2, "0")}`;

  return (
    <div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border border-(--border)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Window chrome. The session pill is the part that earns its space:
            it names the state driving whatever is on screen. */}
        <div className="flex items-center gap-3 border-b border-(--border) bg-(--muted) px-3 py-2">
          <div className="flex gap-1.5" aria-hidden>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full opacity-60" style={{ background: c }} />
            ))}
          </div>
          <span className="hidden truncate text-[11px] text-(--muted-foreground) sm:inline">
            localhost:3000
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--border) bg-(--card) px-2 py-0.5 font-mono text-[10px] text-(--muted-foreground)">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: active ? "var(--primary)" : "#22c55e" }}
              aria-hidden
            />
            state: {state}
          </span>
          <button
            type="button"
            onClick={replay}
            className="shrink-0 rounded-md border border-(--border) bg-(--card) px-2 py-0.5 text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Replay
          </button>
        </div>

        {/* From here down it is the app, in the app's own palette rather than
            the site's — a preview that adopts the surrounding theme tokens
            shows you this page, not the thing you are buying. */}
        <div className="flex h-[26rem] flex-col bg-white text-zinc-900 sm:h-[30rem] dark:bg-zinc-950 dark:text-zinc-100">
          <header className="flex shrink-0 items-center justify-between px-4 pt-3.5">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Voice Assistant</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Realtime, full-duplex, interruptible
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] font-medium text-zinc-500 sm:inline dark:border-zinc-800 dark:text-zinc-400">
                simulated
              </span>
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  state === "speaking"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : state === "interrupted"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : state === "idle"
                        ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        : "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
                ].join(" ")}
              >
                {STATE_LABEL[state]}
              </span>
            </div>
          </header>

          {/* The floor indicator. Colour follows the owner: emerald while the
              assistant speaks, the default ink while the mic is live — the
              same signal the template's big session button gives. */}
          <div className="flex shrink-0 flex-col items-center gap-1.5 px-4 pt-4">
            <div
              className={
                state === "speaking"
                  ? "text-emerald-500"
                  : "text-zinc-900 dark:text-zinc-100"
              }
            >
              <VoiceWaveform state={reduced ? "idle" : waveformFor(phase)} bars={32} />
            </div>
            <p className="h-4 text-[11px] text-zinc-500 dark:text-zinc-400">
              {STATE_HINT[phase] ?? (active ? "" : "Press to start.")}
            </p>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {turns.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-[13px] text-zinc-400 dark:text-zinc-500">
                The transcript appears here as you talk.
              </div>
            ) : (
              <VoiceConversation turns={turns} />
            )}
          </div>

          {/* Push-to-talk above the call chrome, where the template puts its
              hold-to-talk button. It shows the caller's words as they land;
              the finished sentence moves up into the transcript. */}
          <div className="shrink-0 space-y-2 px-4 pb-3.5">
            <VoiceInput
              state={recording ? "recording" : "idle"}
              transcript={recordingText}
              recordingTime={recordingTime}
              onStart={replay}
              onStop={replay}
            />
            <VoiceCallControls elapsedSeconds={reduced ? 41 : elapsed} onEnd={replay} />
          </div>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
          A scripted replay of one call — the waveform, transcript, push-to-talk and call controls
          above are the real components the template ships, mounted here, but no microphone is open
          and there is no session behind this page. The beat worth watching is the interruption:
          the assistant&rsquo;s bubble snaps back to the words that were actually played, because
          that is what barge-in with playback-time truncation does. The template you download wires
          this to a realtime session over WebRTC.
        </p>
      )}
    </div>
  );
}
