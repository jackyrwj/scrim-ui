import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoContext } from "./demos";
import { memoryChipControls, renderMemoryChip } from "./controls";

export const memoryChipPageConfig: ComponentPageConfig = {
  sourceFile: "memory-chip.tsx",
  heroDemo: <DemoContext />,
  explorer: { schema: memoryChipControls, render: renderMemoryChip },
  usage: [
    "Place the confirmation next to the message that used the memory, so the cause is visible.",
    "Keep it quiet — a permanent status chip is enough; avoid flashing or animations.",
    "Make it clickable when there is somewhere useful to go (the memory panel).",
  ],
  mistakes: [
    "Confirming every single save — noise teaches users to ignore it.",
    "Using the chip with no destination when it is clickable.",
    "Showing memory status where the user never asked about it (a marketing-style banner).",
  ],
};
