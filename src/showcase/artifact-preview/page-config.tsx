import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { artifactPreviewControls, renderArtifactPreview } from "./controls";

export const artifactPreviewPageConfig: ComponentPageConfig = {
  sourceFile: "artifact-preview.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: artifactPreviewControls, render: renderArtifactPreview },
  usage: [
    "Render the preview yourself and hand it in — the panel never executes generated code or raw HTML.",
    "Keep header, toggle and actions stable while content streams; movement belongs inside the content area.",
    "Treat a render failure as a state of the panel, not the conversation — the chat beside it continues.",
    "Mark an artifact stale when the prompt moved on; silently old output reads as a bug.",
    "Runnable web previews belong in the host's sandboxed iframe, handed in as the preview slot.",
  ],
  mistakes: [
    "Eval'ing or dangerously-set-inner-HTML'ing model output inside the panel — the trust boundary is the point.",
    "Letting the actions wrap off a narrow panel — the header must wrap, never amputate.",
    "A collapsing empty state while streaming, which shoves everything below the panel downward.",
    "Overlapping with Code Execution (runs code), Edit Diff View (reviews edits) or Generative UI (inline widgets) — this is the passive surface, not any of those.",
  ],
};
