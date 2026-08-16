import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoRunning, DemoWaiting, DemoCompleted, DemoFailed, DemoStack } from "./demos";

export const agentStatusPageConfig: ComponentPageConfig = {
  sourceFile: "agent-status.tsx",
  heroDemo: <DemoRunning />,
  variants: [
    {
      id: "running",
      title: "Running",
      note: "Live progress bar, elapsed time and a stop control. The action line describes the current step.",
      demo: <DemoRunning />,
    },
    {
      id: "waiting",
      title: "Waiting",
      note: "Amber 'waiting' state — the agent is paused on a human decision or external dependency.",
      demo: <DemoWaiting />,
    },
    {
      id: "completed",
      title: "Completed",
      note: "Green confirmation with a summary of what the agent actually did.",
      demo: <DemoCompleted />,
    },
    {
      id: "failed",
      title: "Failed",
      note: "Red state with the failing step named, plus a one-click retry.",
      demo: <DemoFailed />,
    },
    {
      id: "stack",
      title: "Multi-agent view",
      note: "Several agents in one panel — each with its own lifecycle. This is what a fleet UI looks like.",
      demo: <DemoStack />,
    },
  ],
  usage: [
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
