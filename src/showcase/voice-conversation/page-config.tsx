import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoConversation, DemoPlaying } from "./demos";

export const voiceConversationPageConfig: ComponentPageConfig = {
  sourceFile: "voice-conversation.tsx",
  heroDemo: <DemoConversation />,
  variants: [
    {
      id: "conversation",
      title: "Transcript",
      note: "Alternating voice turns with timestamps, a speaking indicator and per-turn replay.",
      demo: <DemoConversation />,
    },
    {
      id: "playing",
      title: "Live speaking",
      note: "Press Replay and the speaking indicator cycles through the turns as the audio 'plays'.",
      demo: <DemoPlaying />,
    },
  ],
  usage: [
    "Show who is speaking with an animated waveform — silence reads as 'offline' at a glance.",
    "Offer per-turn replay; voice is ephemeral and users will want to re-hear a number.",
    "Keep timestamps so users can judge length before replaying a long answer.",
    "Mirror the layout for the user's turns (right-aligned) to match chat conventions.",
  ],
  mistakes: [
    "A transcript with no way to re-hear anything — the whole point of voice is lost.",
    "Animating every turn at once, so the speaking indicator carries no information.",
    "No visual distinction between user and assistant turns.",
  ],
};
