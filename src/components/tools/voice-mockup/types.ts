import { type MockupDevice } from "../device-presets";

export type { MockupDevice };

export type VoiceStage =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "interrupted";

export type VoiceTurnRole = "user" | "assistant";

export type VoiceTurn = {
  id: string;
  role: VoiceTurnRole;
  text: string;
  time?: string;
  speaking?: boolean;
};

export type VoiceMockupConfig = {
  title: string;
  subtitle: string;
  device: MockupDevice;
  theme: "light" | "dark";
  stage: VoiceStage;
  liveTranscript: string;
  elapsedTime: string;
  assistantReply: string;
  showControls: boolean;
  turns: VoiceTurn[];
};

let idSeq = 0;
export function newTurnId(): string {
  return `v${++idSeq}`;
}

export function createTurn(role: VoiceTurnRole, text = ""): VoiceTurn {
  return { id: newTurnId(), role, text };
}

export const defaultConfig: VoiceMockupConfig = {
  title: "Voice Assistant",
  subtitle: "Hands-free answers",
  device: "mobile",
  theme: "light",
  stage: "idle",
  liveTranscript: "",
  elapsedTime: "0:00",
  assistantReply:
    "Streaming makes the first token feel instant. Keep the reveal smooth and offer a stop control.",
  showControls: true,
  turns: [
    {
      id: "t1",
      role: "assistant",
      text: "Hi, I’m your voice assistant. Tap the mic and talk — I’ll answer out loud.",
      time: "Now",
    },
    {
      id: "t2",
      role: "user",
      text: "What makes a voice interface feel responsive?",
      time: "0:05",
    },
  ],
};

export const STAGE_LABELS: Record<VoiceStage, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  interrupted: "Interrupted",
};

export const STAGE_HINTS: Record<VoiceStage, string> = {
  idle: "Tap the mic to start talking",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  interrupted: "Interrupted",
};
