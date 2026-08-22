import type { Metadata } from "next";
import { VoiceScripts } from "@/components/tools/voice-scripts/voice-scripts";

export const metadata: Metadata = {
  title: "Voice Conversation Script Library",
  description:
    "Ready-made voice assistant transcripts for common scenarios. Load them into the mockup generator, copy the text, or use them as starting points.",
};

export default function VoiceScriptsPage() {
  return <VoiceScripts />;
}
