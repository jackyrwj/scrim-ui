import type { PatternPageConfig } from "@/lib/pattern-page";
import { VoiceAssistantPattern } from "./voice-assistant";

export const voiceAssistantPageConfig: PatternPageConfig = {
  sourceFile: "voice-assistant.tsx",
  heroDemo: <VoiceAssistantPattern />,
  elements: [
    { label: "Voice Input", componentSlug: "voice-input" },
    { label: "Voice Waveform", componentSlug: "voice-waveform" },
    { label: "Voice Conversation", componentSlug: "voice-conversation" },
    { label: "Streaming Message", componentSlug: "streaming-message" },
    { label: "Prompt Input", componentSlug: "prompt-input" },
  ],
  usage: [
    "Mirror the audio state in the UI — listening, recording and speaking should each have a distinct visual, never just a spinner.",
    "Keep the transcript readable: committed turns stay as text while the live waveform reflects only the current utterance.",
    "Offer a typed fallback under the mic — voice-first does not mean voice-only, and transcription errors need an escape hatch.",
    "Stream the spoken answer as text too, so the reply stays reviewable and searchable after the audio finishes.",
    "Stop controls must end the turn cleanly — stopping the reply, the recording or the utterance should never orphan the transcript.",
  ],
  mistakes: [
    "Showing a static mic icon with no state change — the user cannot tell if the assistant is actually listening.",
    "Letting the waveform animate when nothing is happening; an idle waveform is noise, not information.",
    "No way to cancel a recording, forcing the user to finish a sentence they never started.",
    "Voice-only with no text transcript — anything the user can hear should be readable afterward.",
  ],
};
