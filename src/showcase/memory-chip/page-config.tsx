import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoContext, DemoOn } from "./demos";

export const memoryChipPageConfig: ComponentPageConfig = {
  sourceFile: "memory-chip.tsx",
  heroDemo: <DemoContext />,
  variants: [
    {
      id: "context",
      title: "In conversation",
      note: "The chip confirms a memory was saved, right where the assistant used it.",
      demo: <DemoContext />,
    },
    {
      id: "on",
      title: "Status indicator",
      note: "A quiet, always-visible signal that memory is active and how full it is.",
      demo: <DemoOn />,
    },
  ],
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
