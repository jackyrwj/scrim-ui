import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { contextFilesControls, renderContextFiles } from "./controls";

export const contextFilesPageConfig: ComponentPageConfig = {
  sourceFile: "context-files.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: contextFilesControls, render: renderContextFiles },
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
