import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoInline } from "./demos";
import { citationUiControls, renderCitationUi } from "./controls";

export const citationUiPageConfig: ComponentPageConfig = {
  sourceFile: "citation-ui.tsx",
  heroDemo: <DemoInline />,
  explorer: { schema: citationUiControls, render: renderCitationUi },
  usage: [
    "Number sources in order of first citation so markers stay stable through the answer.",
    "Make the marker a real button/link — hover previews, click opens. Never a span with a title attribute.",
    "Keep hover cards above or below the text with enough offset they can't cover the next sentence.",
    "Provide the source list at the bottom — some users skip inline markers entirely.",
    "Keep snippets to two lines; the card should be glanceable, not a second article.",
  ],
  mistakes: [
    "Dropping markers into streaming text before the citation exists — cite only what's already grounded.",
    "Making the hover card dismiss on mouse-leave between text and card — bridge the gap with padding.",
    "Rendering citations as plain superscript numbers with no affordance that they're links.",
    "Reusing the same number for different sources across the answer — users will assume the error is theirs.",
  ],
};
