import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { contextUsageControls, renderContextUsage } from "./controls";

export const contextUsagePageConfig: ComponentPageConfig = {
  sourceFile: "context-usage.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: contextUsageControls, render: renderContextUsage },
  usage: [
    "Reserve room for the reply and measure fullness against what is left. The window is shared between the request and the response, and the response is what breaks first.",
    "Give each segment an eviction rank, and leave it undefined for anything that cannot be dropped. 'Pinned' then becomes a fact the component can check rather than a label somebody typed.",
    "Name what goes first in the warning. 'Context is 92% full' tells the reader they are in trouble; naming the segment tells them what to do about it.",
    "Count with the tokenizer of the model you are about to call. The same text is a different number on a different model, and a figure carried over from another provider is decoration.",
    "Break the bar down by source. A single fullness percentage is the version everyone builds and it answers the wrong question.",
    "Set the estimated flag rather than silently rounding. A number that is honest about being approximate is more useful than one that is quietly wrong.",
  ],
  mistakes: [
    "Measuring against the whole window with no reply reserve. At 96% the bar looks survivable and the request cannot succeed.",
    "Showing one aggregate percentage. Nobody can act on it, and the segment that is actually eating the window stays invisible.",
    "Dropping context silently. The model forgets a file, the user notices before the interface does, and there is nothing on screen that explains it.",
    "Drawing the free space as a solid block in the same style as the segments. It reads as another consumer, and the reader thinks the window is fuller than it is.",
    "Reusing a token count across models. It is off by enough to matter exactly when the number matters, which is near the limit.",
  ],
};
