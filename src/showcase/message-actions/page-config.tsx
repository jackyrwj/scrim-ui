import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoStreaming, DemoCompact } from "./demos";

export const messageActionsPageConfig: ComponentPageConfig = {
  sourceFile: "message-actions.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Default",
      note: "Copy, regenerate, share and up/down feedback sit in a quiet row under the message, aligned with its content.",
      demo: <DemoDefault />,
    },
    {
      id: "streaming",
      title: "While streaming",
      note: "Actions dim and disable while the message is still generating — feedback on a partial answer is noise.",
      demo: <DemoStreaming />,
    },
    {
      id: "compact",
      title: "Compact",
      note: "Icon-only mode keeps the transcript dense while preserving every action on hover.",
      demo: <DemoCompact />,
    },
  ],
  usage: [
    "Anchor actions to the message, not the viewport — the user's next step is about that specific answer.",
    "Disable feedback actions while streaming; a vote on half a sentence teaches the model nothing.",
    "Order by likelihood: copy first for chat, then regenerate, then share and feedback.",
    "Give every icon a tooltip or aria-label; icon-only rows are unreadable without one.",
  ],
  mistakes: [
    "Showing the full action row on every message permanently — it should appear on hover or focus in long transcripts.",
    "Using copy as the only feedback path; users who can't regenerate build their own workarounds.",
    "Letting a thumbs-down change the visible text instantly without offering a way to revise or undo.",
  ],
};
