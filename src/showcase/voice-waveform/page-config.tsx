import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoStates, DemoHero } from "./demos";

export const voiceWaveformPageConfig: ComponentPageConfig = {
  sourceFile: "voice-waveform.tsx",
  heroDemo: <DemoHero />,
  variants: [
    {
      id: "states",
      title: "All states",
      note: "One component, four speeds and opacities — idle, listening, recording and speaking.",
      demo: <DemoStates />,
    },
    {
      id: "hero",
      title: "In conversation",
      note: "The waveform sits next to the speaker and replaces the text bubble while they talk.",
      demo: <DemoHero />,
    },
  ],
  usage: [
    "Animate bars only when audio is actually flowing — a moving idle waveform is noise.",
    "Use distinct colors per state (green listening, red recording) so the state reads at a glance.",
    "Match the animation speed to real energy: faster bars for speaking, slower for listening.",
    "Keep the component silent-friendly — it should also work with a screen reader label.",
  ],
  mistakes: [
    "Fake-animating a waveform while nothing is happening — users learn to distrust it.",
    "One ambiguous color for every state; states must be distinguishable without reading.",
    "Bars so short they read as static dots, or so tall they crowd the layout.",
  ],
};
