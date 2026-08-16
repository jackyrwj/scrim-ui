import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoEmpty } from "./demos";

export const memoryListPageConfig: ComponentPageConfig = {
  sourceFile: "memory-list.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Default",
      note: "A live memory panel — add a fact, forget an old one. This is the assistant's working memory of the user.",
      demo: <DemoDefault />,
    },
    {
      id: "empty",
      title: "Empty state",
      note: "First-run state. Tell the user what belongs here before anything is saved.",
      demo: <DemoEmpty />,
    },
  ],
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
