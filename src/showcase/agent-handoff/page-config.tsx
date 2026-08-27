import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { agentHandoffControls, renderAgentHandoff } from "./controls";

export const agentHandoffPageConfig: ComponentPageConfig = {
  sourceFile: "agent-handoff.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: agentHandoffControls, render: renderAgentHandoff },
  usage: [
    "Compute `withheld` as a real diff between what the parent knew and what the child was given. It is the half that predicts the next silent failure, and the half nobody renders.",
    "Show the task exactly as the receiving agent will see it, not a summary for the reader. The gap between those two is where handoff bugs live.",
    "Render the return trip on the same card. Two unrelated cards lose the question of whether the caller is still waiting.",
    "Say why this agent. 'Different toolset' or 'different permissions' is a real reason; routing with no stated reason is a hint that the split is architectural habit rather than need.",
    "Keep the state honest about who holds the work — handing off, working, returned. A reader debugging a stalled run needs to know which agent to look at.",
  ],
  mistakes: [
    "Rendering only the arrow. Every multi-agent demo does this, and it shows the one part of a handoff that never goes wrong.",
    "Hiding what was not carried. The receiving agent redoes settled work, nothing errors, and the output is merely worse in a way nobody can attribute later.",
    "Summarising the task for the display instead of showing what was sent. The reader then reviews a message the agent never received.",
    "Treating a handoff as fire-and-forget. Without a returned state, a child agent that failed silently leaves a run that looks like it is still thinking.",
    "Splitting agents by topic rather than by tool or permission. Every split re-reads context, so the cost is real and the benefit has to be more than tidiness.",
  ],
};
