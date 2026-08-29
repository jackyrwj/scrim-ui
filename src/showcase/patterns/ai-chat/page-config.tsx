import type { PatternPageConfig } from "@/lib/pattern-page";
import { AIChatPattern } from "./ai-chat";

export const aiChatPageConfig: PatternPageConfig = {
  sourceFile: "ai-chat.tsx",
  heroDemo: <AIChatPattern />,
  elements: [
    { label: "Conversation Sidebar", componentSlug: "conversation-sidebar" },
    { label: "Response Versions", componentSlug: "response-versions" },
    { label: "Streaming Message", componentSlug: "streaming-message" },
    { label: "Prompt Input", componentSlug: "prompt-input" },
    { label: "Context Picker", componentSlug: "context-picker" },
    { label: "Prompt Input + Model Selector", componentSlug: "prompt-input-model-selector" },
    { label: "Citation UI", componentSlug: "citation-ui" },
    { label: "Source Card", componentSlug: "source-card" },
  ],
  usage: [
    "Keep the composer always visible at the bottom — it's the primary action of a chat app.",
    "Stream responses in place; never jump the user to a new screen mid-turn.",
    "Add citations only after the claim is grounded — never during streaming.",
    "Provide a model selector at the composer, not in settings.",
    "Auto-scroll to the bottom only when the user is already at the bottom.",
  ],
  mistakes: [
    "Pushing the composer below the fold as messages grow — it must stay reachable.",
    "Wiping the draft or the thread when switching models.",
    "Hiding attachments behind a menu — the + button belongs next to the input.",
    "No way to stop a generation, forcing the user to watch it finish.",
  ],
};
