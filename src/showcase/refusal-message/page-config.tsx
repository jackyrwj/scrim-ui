import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoRefusal } from "./demos";
import { refusalMessageControls, renderRefusalMessage } from "./controls";

export const refusalMessagePageConfig: ComponentPageConfig = {
  sourceFile: "refusal-message.tsx",
  heroDemo: <DemoRefusal />,
  explorer: { schema: refusalMessageControls, render: renderRefusalMessage },
  usage: [
    "State what won't be done, then why in the user's own terms — never a policy clause number, which reads as hiding behind a rulebook.",
    "Offer exactly one redirect and make it a button; retyping the safe version by hand is friction at the moment of maximum frustration.",
    "Keep the surface neutral. A refusal is the system working as intended, not an error — red alert styling it hasn't earned only inflames.",
    "Keep the refusal in the message thread so the record of what was asked and declined survives.",
  ],
  mistakes: [
    "A bare 'I can't help with that' with no reason and no pivot — the user learns nothing and the conversation is over.",
    "Apologising three times before getting to the point; the refusal should be the first sentence, not the third.",
    "Refusing the whole request when only part of it is over the line — answer the safe half, decline the rest.",
  ],
};
