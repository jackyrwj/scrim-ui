import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoVoiceCall } from "./demos";
import { voiceCallControlsControls, renderVoiceCallControls } from "./controls";

export const voiceCallControlsPageConfig: ComponentPageConfig = {
  sourceFile: "voice-call-controls.tsx",
  heroDemo: <DemoVoiceCall />,
  explorer: { schema: voiceCallControlsControls, render: renderVoiceCallControls },
  usage: [
    "Make mute unmistakable — slashed mic, filled toggle, and the word 'Muted'. An icon swap alone is missed at exactly the wrong moment.",
    "Keep the elapsed timer running and visible; in a call with no scrollback it is the only proof the line is still open.",
    "End stays one tap, always visible, never in a menu — a user who can't find the exit kills the tab instead.",
    "Keep transcript and waveform on the conversation surface above; this bar is only the session chrome.",
  ],
  mistakes: [
    "Hiding mute behind a long-press or a settings sheet during a live call.",
    "Letting the timer freeze on a dropped connection — the UI then lies about the call being alive.",
    "Ending the call with the same styling as every other button, so the destructive action has no gravity.",
  ],
};
