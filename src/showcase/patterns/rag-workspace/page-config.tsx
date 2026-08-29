import type { PatternPageConfig } from "@/lib/pattern-page";
import { RagWorkspacePattern } from "./rag-workspace";

export const ragWorkspacePageConfig: PatternPageConfig = {
  sourceFile: "rag-workspace.tsx",
  heroDemo: <RagWorkspacePattern />,
  elements: [
    { label: "File Upload", componentSlug: "file-upload" },
    { label: "Context Files", componentSlug: "context-files" },
    { label: "Context Usage", componentSlug: "context-usage" },
    { label: "Citation UI", componentSlug: "citation-ui" },
    { label: "Source List", componentSlug: "source-list" },
    { label: "Streaming Message", componentSlug: "streaming-message" },
    { label: "Prompt Input", componentSlug: "prompt-input" },
  ],
  usage: [
    "Ground every answer in inspectable retrieval — citations on the claims, passages with scores one disclosure away.",
    "Treat 'not found' as a first-class answer: say what was considered, and never let the model guess past the floor.",
    "Make the context window a visible budget — uploads move the bar, and the near-limit state warns before eviction.",
    "Flag answers that lose their grounding when a cited document is removed mid-session.",
    "Keep upload, retrieval and context cost in one rail so 'what does the model know' is answerable at a glance.",
  ],
  mistakes: [
    "Answering from nothing — a below-floor retrieval that silently becomes a confident hallucination.",
    "Showing only the passages that passed; the user can't tell 'no result' from 'no documents'.",
    "Removing a document with no trace while its citations stay on screen, still looking grounded.",
    "A context meter that only appears at 100% — by then the eviction has already happened.",
  ],
};
