import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDots, DemoCaret, DemoLabel } from "./demos";

export const thinkingIndicatorPageConfig: ComponentPageConfig = {
  sourceFile: "thinking-indicator.tsx",
  heroDemo: <DemoDots />,
  variants: [
    {
      id: "dots",
      title: "Dots",
      note: "Three bouncing dots inside a message bubble — the most recognized 'working on it' signal in chat UIs.",
      demo: <DemoDots />,
    },
    {
      id: "caret",
      title: "Caret",
      note: "A steady blinking caret reads as the model about to start typing — pairs well with a streaming reveal that follows.",
      demo: <DemoCaret />,
    },
    {
      id: "label",
      title: "Label",
      note: "A softly pulsing status line for longer waits — 'Researching', 'Reviewing files', 'Running tools' — tells the user what the agent is doing.",
      demo: <DemoLabel />,
    },
  ],
  usage: [
    "Use the thinking indicator only for the pre-stream gap; the moment text starts flowing, it should disappear.",
    "Pick a label that says what the model is doing, not a generic spinner word — 'Thinking' beats 'Loading'.",
    "Keep the indicator inside the message thread so the coming reply has a home.",
    "Animate with CSS keyframes, not per-frame JS — a three-dot bounce shouldn't cost a re-render.",
  ],
  mistakes: [
    "Letting the indicator linger after the first token — it directly contradicts the streaming reply it was announcing.",
    "Replacing it with an infinite spinner for a wait you can't explain; a label is almost always more honest.",
    "Animating dots with setInterval instead of CSS, causing layout jank on every tick.",
  ],
};
