import type { PatternPageConfig } from "@/lib/pattern-page";
import { SupportCopilotPattern } from "./support-copilot";

export const supportCopilotPageConfig: PatternPageConfig = {
  sourceFile: "support-copilot.tsx",
  heroDemo: <SupportCopilotPattern />,
  elements: [
    { label: "Conversation Sidebar", componentSlug: "conversation-sidebar" },
    { label: "Context Picker", componentSlug: "context-picker" },
    { label: "Citation UI", componentSlug: "citation-ui" },
    { label: "Source List", componentSlug: "source-list" },
    { label: "Confidence Answer", componentSlug: "confidence-answer" },
    { label: "Inline Correction", componentSlug: "inline-correction" },
    { label: "Approval Request", componentSlug: "approval-request" },
    { label: "Response Rating", componentSlug: "response-rating" },
  ],
  usage: [
    "Ground every draft: citations under the answer, retrieved passages with scores one disclosure away.",
    "Say low confidence out loud — name the exact thing to check, not a vague percentage.",
    "Let the agent correct a wrong fact inline; the correction feeds the copilot and the original stays as the receipt.",
    "Gate money moves: the copilot drafts the refund, a human approves it, and both outcomes leave a visible receipt.",
    "Put a rating row under every draft — thumbs with reason chips are how the team finds the topics the copilot handles badly.",
  ],
  mistakes: [
    "A confident-looking draft with no sources — in support, an ungrounded answer is a refund dispute waiting to happen.",
    "Silently falling back to a guess when retrieval is thin instead of surfacing a low-confidence answer.",
    "Corrections typed into a feedback void — if fixing a fact doesn't change the next draft, agents stop correcting.",
    "Auto-executing refunds because 'the policy check passed' — policy eligibility is not authorization.",
    "Thumbs-down with no reason chips: a bare downvote can't tell a wrong-policy problem from a tone problem.",
  ],
};
