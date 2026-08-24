import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDots } from "./demos";
import { thinkingIndicatorControls, renderThinkingIndicator } from "./controls";

export const thinkingIndicatorPageConfig: ComponentPageConfig = {
  sourceFile: "thinking-indicator.tsx",
  heroDemo: <DemoDots />,
  explorer: { schema: thinkingIndicatorControls, render: renderThinkingIndicator },
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
