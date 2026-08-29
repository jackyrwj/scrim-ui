import type { PatternPageConfig } from "@/lib/pattern-page";
import { ArtifactWorkspacePattern } from "./artifact-workspace";

export const artifactWorkspacePageConfig: PatternPageConfig = {
  sourceFile: "artifact-workspace.tsx",
  heroDemo: <ArtifactWorkspacePattern />,
  elements: [
    { label: "Conversation Sidebar", componentSlug: "conversation-sidebar" },
    { label: "Streaming Message", componentSlug: "streaming-message" },
    { label: "Response Versions", componentSlug: "response-versions" },
    { label: "Prompt Input", componentSlug: "prompt-input" },
    { label: "Artifact Preview", componentSlug: "artifact-preview" },
  ],
  usage: [
    "Open the artifact from the answer that made it — the panel is a consequence of the conversation, not a separate app.",
    "Keep the panel's chrome in its final position while content streams; nothing should re-layout mid-generation.",
    "Append artifact versions; only follow to the newest when the reader is already on the latest.",
    "Treat a failed artifact as a state of the panel — the chat beside it carries on, the last good version stays.",
    "On narrow screens make the artifact an overlay you visit from a floating affordance, not a squeezed second column.",
  ],
  mistakes: [
    "Yanking the reader to a new artifact version while they're paging through older ones.",
    "Collapsing or shifting the panel as content streams — movement belongs inside the content area.",
    "Letting a broken artifact error the whole workspace or swallow the conversation.",
    "Re-rendering the artifact from scratch on every revision instead of streaming only the change.",
  ],
};
