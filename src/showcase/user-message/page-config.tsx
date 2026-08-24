import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { userMessageControls, renderUserMessage } from "./controls";

export const userMessagePageConfig: ComponentPageConfig = {
  sourceFile: "user-message.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: userMessageControls, render: renderUserMessage },
  usage: [
    "Right-align the user's turn and left-align the assistant's — the strongest possible signal of who said what in a conversation.",
    "Show actions only on the focused or hovered message to keep the transcript calm; pin them always for short-lived transcripts.",
    "Use the 'Edited' chip honestly — it changes how the model should treat the turn and how collaborators read the thread.",
    "Put copy and regenerate on the user turn too: users re-run or refine their own prompt as often as they regenerate an answer.",
  ],
  mistakes: [
    "Making the bubble the same color as the assistant's — the fill contrast is the primary sender signal.",
    "Clipping long prompts with an ellipsis in the transcript; let them wrap and scroll naturally.",
    "Showing every action on every message at once, which turns a chat log into a toolbar wall.",
  ],
};
