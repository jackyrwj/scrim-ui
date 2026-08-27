import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { inlineCorrectionControls, renderInlineCorrection } from "./controls";

export const inlineCorrectionPageConfig: ComponentPageConfig = {
  sourceFile: "inline-correction.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: inlineCorrectionControls, render: renderInlineCorrection },
  usage: [
    "Keep the original and the correction as two fields. The pair is the training example — what the model said and what a human replaced it with — and either half alone is close to worthless.",
    "Emit a correction, not a message. Sending a new turn is a different act with a different meaning, and conflating them means every correction drags the conversation forward.",
    "Store the model version and the message id with the correction, or you cannot tell later whether the next version fixed it.",
    "Put the caret at the end rather than selecting the whole answer. A correction is usually a small edit to a long paragraph, and select-all means the first keystroke destroys it.",
    "Make Withdraw a delete. A correction that is hidden but still in the table is a label you will train on and cannot explain.",
    "Show the edit affordance on focus as well as hover, or keyboard and touch users never find it.",
  ],
  mistakes: [
    "Editing the answer in place. It looks like the tidiest possible implementation and it throws away the only part that identifies the failure.",
    "Sending the correction as the next user message. The conversation moves, the model responds to it, and what you wanted to record was a label rather than a turn.",
    "Discarding the draft on Escape. It happens once, to a long correction, and that person never uses the feature again.",
    "Adding a formatting toolbar. A correction is a claim about facts; rich text invites edits about taste, which is noise in the dataset this exists to build.",
    "Accepting a correction identical to the original. It is a no-op the reader thinks worked, and a row of them quietly dilutes every metric computed over the table.",
  ],
};
