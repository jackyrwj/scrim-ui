import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoModeration } from "./demos";
import { moderationFlagControls, renderModerationFlag } from "./controls";

export const moderationFlagPageConfig: ComponentPageConfig = {
  sourceFile: "moderation-flag.tsx",
  heroDemo: <DemoModeration />,
  explorer: { schema: moderationFlagControls, render: renderModerationFlag },
  usage: [
    "Keep the partial response on screen when a stream is cut — deleting words the reader already saw is gaslighting, and it destroys trust in every other message.",
    "Distinguish where the flag fired: a blocked prompt and a stopped response are different situations with different recovery actions.",
    "Always offer the false-positive path. 'Report a mistake' is how flagging improves, and the only thing keeping a legitimate user from reading the flag as an accusation.",
    "One primary recovery action; the appeal stays a quiet text link so the choice is never ambiguous.",
  ],
  mistakes: [
    "Wiping the streamed text and showing only a generic warning — the user saw those words, and pretending otherwise reads as a cover-up.",
    "A flag with no retry and no appeal: a dead end that treats every flagged user as guilty.",
    "Naming the policy clause instead of saying what happened in one plain sentence.",
  ],
};
