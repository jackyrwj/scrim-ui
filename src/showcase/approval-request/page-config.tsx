import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoPending, DemoCode, DemoApproved, DemoDenied } from "./demos";

export const approvalRequestPageConfig: ComponentPageConfig = {
  sourceFile: "approval-request.tsx",
  heroDemo: <DemoPending />,
  variants: [
    {
      id: "pending",
      title: "Pending",
      note: "A real approval card — context, the exact action, and an auto-deny countdown so requests never linger.",
      demo: <DemoPending />,
    },
    {
      id: "code",
      title: "Code change",
      note: "File diffs render in a mono block so the user can actually judge the change before allowing.",
      demo: <DemoCode />,
    },
    {
      id: "approved",
      title: "Approved",
      note: "Confirmation that the action was executed — the agent continues from here.",
      demo: <DemoApproved />,
    },
    {
      id: "denied",
      title: "Denied",
      note: "The action is blocked and the agent is told to find another way.",
      demo: <DemoDenied />,
    },
  ],
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
