import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { outputComparisonControls, renderOutputComparison } from "./controls";

export const outputComparisonPageConfig: ComponentPageConfig = {
  sourceFile: "output-comparison.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: outputComparisonControls, render: renderOutputComparison },
  usage: [
    "Randomise which model you pass as `a` on every comparison, and record which one sat in each slot. Left wins more than right, reliably, and this is the only place that can be fixed.",
    "Keep the names hidden until a choice exists. A visible label is the belief being measured, not the answer.",
    "Reveal them straight after. Permanent concealment reads as the tool having something to hide, and costs you the reviewer's trust for nothing.",
    "Record ties. Two indistinguishable answers are a real finding, and the alternative is a coin flip you cannot identify later.",
    "Store the prompt, both outputs and both model versions with the judgement — a preference with no idea what produced it cannot be re-analysed when the next version ships.",
    "Give both panes the same fixed height. It does not remove length bias, but it stops the layout from announcing which answer is longer before either has been read.",
  ],
  mistakes: [
    "Showing the model names. The single most effective way to collect a few hundred judgements that measure reputation rather than output.",
    "Fixing the slots — one model always on the left. Position bias then rides along inside every result and is impossible to subtract afterwards.",
    "Removing the tie button to force a signal. Manufactured signal is confidently wrong in whichever direction the position bias points.",
    "Letting the panes size to their content. The longer answer is visible as a taller box from across the room, and long answers already win more than they should.",
    "Recording only the winner's model name. Without the pair and the slot assignment, the judgement cannot be audited or re-used.",
  ],
};
