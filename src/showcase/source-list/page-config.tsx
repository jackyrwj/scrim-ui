import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { sourceListControls, renderSourceList } from "./controls";

export const sourceListPageConfig: ComponentPageConfig = {
  sourceFile: "source-list.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: sourceListControls, render: renderSourceList },
  usage: [
    "Pass every candidate retrieval considered, not only the survivors. The panel's job is to separate 'nothing relevant existed' from 'the model invented it', and it cannot do that from the survivors alone.",
    "Apply the floor before the model call, not after. A candidate under the floor is not a weak source, it is not a source, and sending it invites a confident answer built on it.",
    "Show the scores. Somebody is always tuning the floor, and a threshold chosen without seeing the distribution it cuts is a number that was guessed.",
    "Number the rows to match the citation markers in the answer. The number is what the reader matches on, and two different numbering schemes are worse than none.",
    "Keep the empty state a real answer. No chunk cleared the floor, no model call, a fixed sentence — that is the system working, and it deserves better than a blank panel.",
  ],
  mistakes: [
    "Showing only the top k. The interesting question is what came sixth and how close it was, which is exactly what gets thrown away.",
    "Rendering 'no sources' as an empty box. The one moment the system refused to make something up looks identical to a component that failed to load.",
    "Sorting by document order or by title. The panel then disagrees with its own score column, and the reader stops trusting both.",
    "Hiding the below-floor candidates entirely. The floor becomes untunable, because nothing on screen says what it is cutting.",
    "Letting the passage snippet grow to full height. Five expanded passages push the answer off the screen, and the panel is a reference, not the content.",
  ],
};
