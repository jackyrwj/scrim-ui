import type { PatternPageConfig } from "@/lib/pattern-page";
import { AgentConsolePattern } from "./agent-console";

export const agentConsolePageConfig: PatternPageConfig = {
  sourceFile: "agent-console.tsx",
  heroDemo: <AgentConsolePattern />,
  elements: [
    { label: "Agent Run Timeline", componentSlug: "agent-run-timeline" },
    { label: "Agent Status", componentSlug: "agent-status" },
    { label: "Agent Handoff", componentSlug: "agent-handoff" },
  ],
  usage: [
    "Answer 'who's doing what' in one glance: one status card per agent, and selecting a card swaps the timeline — never the page.",
    "Make the handoff inspectable where it happened: what context was carried across, and what was deliberately withheld.",
    "Count pending approvals at fleet level in the header, but keep the Approve/Reject buttons inline in the owning agent's log.",
    "Treat a failed child run as one card, not an outage — the rest of the fleet keeps working, and Rerun is per-agent.",
    "Show cost twice: per-run in each agent's summary, summed for the fleet in the roster footer.",
  ],
  mistakes: [
    "One global spinner for the whole fleet, so a hung Billing agent hides that Research is nearly done.",
    "Handoffs shown as a bare arrow with no context receipt — the reader can't audit what the next agent actually saw.",
    "Approval gates that float in a modal detached from the run — the decision needs the log around it.",
    "Retries that overwrite the failed step instead of appending a linked event, erasing the history you need to debug.",
    "Cost shown only in aggregate — a runaway agent is invisible until the invoice arrives.",
  ],
};
