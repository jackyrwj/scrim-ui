import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoIdle } from "./demos";
import { voiceInputControls, renderVoiceInput } from "./controls";

export const voiceInputPageConfig: ComponentPageConfig = {
  sourceFile: "voice-input.tsx",
  heroDemo: <DemoIdle />,
  explorer: { schema: voiceInputControls, render: renderVoiceInput },
  usage: [
    "Offer voice next to text, never instead of it — some users always prefer typing.",
    "Make the recording state unmistakable: red accent, live waveform, elapsed time.",
    "Show a live transcript as speech is captured so users can catch mis-transcriptions early.",
    "Provide Stop (finish) and Cancel (discard) as separate, clearly labeled actions.",
  ],
  mistakes: [
    "A microphone icon with no hint of what happens when you click it.",
    "Starting to record with no visible change — the user is unsure whether they are being recorded.",
    "No way to discard a recording; users stay stuck with a half-spoken message.",
  ],
};
