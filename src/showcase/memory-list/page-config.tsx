import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { memoryListControls, renderMemoryList } from "./controls";

export const memoryListPageConfig: ComponentPageConfig = {
  sourceFile: "memory-list.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: memoryListControls, render: renderMemoryList },
  usage: [
    "Show memory somewhere discoverable — a sidebar panel or settings page, never hidden.",
    "Make every memory forgettable in one click; forgetting should be instant and permanent.",
    "Let the user add memories directly, not only what the assistant happens to save.",
    "Label when each memory was captured so stale facts are easy to spot.",
  ],
  mistakes: [
    "Storing sensitive data such as passwords or secrets without warning the user.",
    "No bulk management — an un-sortable list becomes a liability as it grows.",
    "Quietly remembering things the user never agreed to save.",
  ],
};
