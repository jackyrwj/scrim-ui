import type { Metadata } from "next";
import { Suspense } from "react";
import { VoiceMockup } from "@/components/tools/voice-mockup/voice-mockup";

export const metadata: Metadata = {
  title: "Voice Assistant Mockup Generator",
  description:
    "Compose realistic voice assistant screenshots with listening, thinking, speaking and interrupted states, then export them as PNG. Free, no signup, works in your browser.",
};

export default function VoiceMockupPage() {
  return (
    <Suspense fallback={null}>
      <VoiceMockup />
    </Suspense>
  );
}
