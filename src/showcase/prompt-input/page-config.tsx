import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { promptInputControls, renderPromptInput } from "./controls";

export const promptInputPageConfig: ComponentPageConfig = {
  sourceFile: "prompt-input.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: promptInputControls, render: renderPromptInput },
  usage: [
    "Send on Enter, newline on Shift+Enter — never the reverse.",
    "Keep the send button disabled (not hidden) while the input is empty so its position is stable.",
    "Swap send for a stop button while generating — one target, two states.",
    "Preserve the draft on error. Losing a long prompt is the worst possible failure.",
    "Cap the auto-grow height (~5–6 lines) so long prompts never push the conversation off screen.",
  ],
  mistakes: [
    "Hiding the model selector behind settings — model choice belongs at the point of prompting.",
    "Showing a spinner without a way to cancel a generation.",
    "Clearing attachments after send without telling the user they were included.",
    "Letting the textarea grow without bound and cover the whole viewport.",
  ],
};
