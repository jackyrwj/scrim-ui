import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoStreaming, DemoComplete, DemoStopped, DemoUserTurn } from "./demos";

export const streamingMessagePageConfig: ComponentPageConfig = {
  sourceFile: "streaming-message.tsx",
  heroDemo: <DemoStreaming />,
  variants: [
    {
      id: "streaming",
      title: "Streaming",
      note: "Text reveals token-by-token with a blinking caret and a 'Generating' badge. The stop pill lets the user interrupt at any point.",
      demo: <DemoStreaming />,
    },
    {
      id: "complete",
      title: "Complete",
      note: "When the response finishes, streaming affordances disappear and the regenerate action appears.",
      demo: <DemoComplete />,
    },
    {
      id: "stopped",
      title: "Stopped",
      note: "If the user interrupts, the partial text is frozen and labeled 'Stopped generating'. Regenerate restarts the turn.",
      demo: <DemoStopped />,
    },
    {
      id: "user-turn",
      title: "User message",
      note: "The same message system reversed — right-aligned, filled bubble, distinct avatar.",
      demo: <DemoUserTurn />,
    },
  ],
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
