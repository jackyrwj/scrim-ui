import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoPending } from "./demos";
import { approvalRequestControls, renderApprovalRequest } from "./controls";

export const approvalRequestPageConfig: ComponentPageConfig = {
  sourceFile: "approval-request.tsx",
  heroDemo: <DemoPending />,
  explorer: { schema: approvalRequestControls, render: renderApprovalRequest },
  usage: [
    "Ask for approval only for irreversible, costly or sensitive actions — not every step.",
    "Always show the concrete action (command, diff, recipients), not a vague 'proceed?'",
    "Include an auto-deny timeout for unattended requests.",
    "Say what happened after the decision — approved actions should confirm execution.",
    "Make Allow/Deny keyboard accessible and order them consistently.",
  ],
  mistakes: [
    "Asking for approval with no context — users can't consent to what they can't see.",
    "No timeout — pending requests pile up and the user returns to a stale queue.",
    "Hiding the cost or blast radius of the action (recipients, rows affected, money).",
    "Treating approval as a formality the agent can bypass with retries.",
  ],
};
