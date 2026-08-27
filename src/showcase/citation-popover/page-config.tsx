import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { citationPopoverControls, renderCitationPopover } from "./controls";

export const citationPopoverPageConfig: ComponentPageConfig = {
  sourceFile: "citation-popover.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: citationPopoverControls, render: renderCitationPopover },
  usage: [
    "Pass the passage, not a passage id. The component's job is to show the text the claim came from, and a lookup by id is one more place for the answer and the sources to disagree.",
    "Slice the passage out of the document with the offsets you carried through retrieval. Storing the text alongside the offsets means the two can drift, and the drift is invisible until someone clicks.",
    "Leave `passage` undefined for a number that was not retrieved. It is a real outcome, not a loading state — the model will occasionally cite a passage it was never given.",
    "Send the sources down the stream before the first token, so a marker resolves the moment it arrives rather than after the answer settles.",
    "Give `onJump` a destination only when there is a document pane on screen. Without one, the popover is the whole affordance and a click that goes nowhere is worse than no click.",
  ],
  mistakes: [
    "Positioning the panel absolutely inside the answer. The answer is a scroll container, and the panel gets clipped by it the first time a citation lands near the bottom.",
    "Opening on hover only. On a phone there is no hover, and the citation becomes text nobody can check.",
    "Repositioning the panel as the page scrolls. It was measured from a rect that has moved; closing is what the reader expected, following the text around is motion they did not ask for.",
    "Rendering an empty popover for an unresolved number. That launders a hallucinated citation into a real-looking one — the state the reader most needs to see becomes the state that looks most normal.",
    "Replacing the number with an icon or a superscript glyph. The number is what the reader matches against the source list, and it is the same character the model wrote.",
  ],
};
