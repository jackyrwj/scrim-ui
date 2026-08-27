import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { agentPlanControls, renderAgentPlan } from "./controls";

export const agentPlanPageConfig: ComponentPageConfig = {
  sourceFile: "agent-plan.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: agentPlanControls, render: renderAgentPlan },
  usage: [
    "Give every step a stable id from the run, not an array index. The plan gets re-emitted with items inserted, and index keys mean React re-uses the wrong row.",
    "Keep completed steps in the order they completed. A step inserted at position two must not slide the four the reader has already read.",
    "Turn a dropped step into `skipped` with the reason. It is the most informative line in the plan, and deleting it leaves a plan that ran cleanly next to a run that did not.",
    "Mark steps the agent added after the first plan. 'It decided to do three more things' is a fact worth having before it finishes doing them.",
    "Show the revision count. Most readers only need to know the plan changed and roughly how much, which is a counter rather than a diff.",
    "Say when the plan is still being written. A short list mid-planning is indistinguishable from a short plan.",
  ],
  mistakes: [
    "Re-rendering the new plan array wholesale. Everything moves, and the reader loses their place in the list they were using to keep it.",
    "Deleting steps the agent abandoned. The run becomes unauditable at exactly the point somebody asks why it did not do the thing it said it would.",
    "Using the array index as the key. Insert one step and React re-uses rows across different steps — states and animations land on the wrong lines.",
    "Rendering the plan as prose the model wrote. It reads fine and cannot be diffed, checked off, or pointed at when something goes wrong.",
    "Showing a progress percentage over a list whose length keeps changing. It goes backwards, which reads as a bug rather than as a revision.",
  ],
};
