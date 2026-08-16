import type { PatternPageConfig } from "@/lib/pattern-page";
import { CodingAgentPattern } from "./coding-agent";

export const codingAgentPageConfig: PatternPageConfig = {
  sourceFile: "coding-agent.tsx",
  heroDemo: <CodingAgentPattern />,
  elements: [
    { label: "Agent Status", componentSlug: "agent-status" },
    { label: "Tool Call", componentSlug: "tool-call" },
    { label: "Approval Request", componentSlug: "approval-request" },
  ],
  usage: [
    "Lead with the agent's current action — a coding agent that narrates builds trust fast.",
    "Show diffs before they're applied, especially when approval is involved.",
    "Gate deploys and migrations behind approval with the exact command shown.",
    "Report pass/fail counts concretely, not 'all good'.",
    "Confirm completion with a summary of what actually changed.",
  ],
  mistakes: [
    "Applying changes before asking — a surprise diff erodes all trust.",
    "Hiding the failing test or error that motivated the change.",
    "Asking for approval without showing cost or blast radius.",
    "Declaring 'done' without test results to back it up.",
  ],
};
