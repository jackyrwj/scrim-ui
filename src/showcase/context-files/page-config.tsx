import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoFull, DemoEmpty } from "./demos";

export const contextFilesPageConfig: ComponentPageConfig = {
  sourceFile: "context-files.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Default",
      note: "A compact panel of files in context with per-file size and a remove affordance.",
      demo: <DemoDefault />,
    },
    {
      id: "full",
      title: "Full context",
      note: "As the window fills, the usage bar turns amber then red. Try removing a file — the count and bar update live.",
      demo: <DemoFull />,
    },
    {
      id: "empty",
      title: "Empty",
      note: "Before any attachment, the panel guides the user toward the attach action instead of showing nothing.",
      demo: <DemoEmpty />,
    },
  ],
  usage: [
    "Make context visible: users behave differently when they can see exactly which files the model is reading.",
    "Show token pressure with a colored bar — red only past ~85% so it means something.",
    "Let users remove files inline; an un-editable context list feels like the model is hiding its inputs.",
    "Truncate long names with an ellipsis and put the size on its own, non-wrapping column.",
  ],
  mistakes: [
    "Hiding which files were used after the fact — the user can't audit or correct a hallucination they can't trace.",
    "Listing internal files the user never chose; context should reflect what the user supplied or approved.",
    "Showing a token bar in a color that doesn't communicate urgency (a green bar at 95% is a lie).",
  ],
};
