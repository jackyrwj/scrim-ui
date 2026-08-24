import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { messageActionsControls, renderMessageActions } from "./controls";

export const messageActionsPageConfig: ComponentPageConfig = {
  sourceFile: "message-actions.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: messageActionsControls, render: renderMessageActions },
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
