import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoStreaming } from "./demos";
import { streamingMessageControls, renderStreamingMessage } from "./controls";

export const streamingMessagePageConfig: ComponentPageConfig = {
  sourceFile: "streaming-message.tsx",
  heroDemo: <DemoStreaming />,
  explorer: { schema: streamingMessageControls, render: renderStreamingMessage },
  usage: [
    "Feed real tokens from your streaming API — this component just reveals whatever `text` it receives; the source of the text doesn't matter.",
    "Show a stop control the moment streaming starts. A generation the user can't cancel reads as broken.",
    "When stopped, freeze the partial text rather than clearing it — the user may want to save or copy it.",
    "Keep the 'Generating' badge subtle; the blinking caret already signals motion.",
    "Use white-space handling carefully — long unbroken tokens need wrapping to avoid horizontal overflow.",
  ],
  mistakes: [
    "Rendering markdown incrementally — syntax highlighting breaks mid-token. Render plain text while streaming, then upgrade when done.",
    "Putting the stop button far from the message — it belongs next to the streaming output.",
    "Resetting scroll position every token. Anchor to the bottom only when the user is already at the bottom.",
    "Animating with setState per keystroke on long messages — batch into 16ms ticks like a frame loop.",
  ],
};
