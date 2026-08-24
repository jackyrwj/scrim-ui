import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoRunning } from "./demos";
import { agentStatusControls, renderAgentStatus } from "./controls";

export const agentStatusPageConfig: ComponentPageConfig = {
  sourceFile: "agent-status.tsx",
  heroDemo: <DemoRunning />,
  explorer: { schema: agentStatusControls, render: renderAgentStatus },
  usage: [
    "Stack one card per agent when several run at once — each keeps its own lifecycle, and the panel becomes a fleet view rather than a single status line.",
    "Name the current action in plain language — users trust agents that narrate what they're doing.",
    "Show a real progress bar only when progress is measurable; otherwise use elapsed time, not a fake bar.",
    "Reserve waiting (amber) for true human or external dependencies, not for loading.",
    "On failure, say which step failed and offer retry — never just 'something went wrong'.",
    "Color the status pill, keep the row itself calm — a wall of colored cards is noise.",
  ],
  mistakes: [
    "Animating a progress bar that isn't backed by real progress — users learn to distrust it.",
    "Hiding agent activity entirely until completion — an agent that runs silently feels like a hang.",
    "Using 'waiting' as a synonym for 'loading' — it misleads about who's holding things up.",
    "No retry affordance on failure, forcing the user to restart the whole run.",
  ],
};
