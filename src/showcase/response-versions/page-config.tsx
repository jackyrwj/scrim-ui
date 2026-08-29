import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { responseVersionsControls, renderResponseVersions } from "./controls";

export const responseVersionsPageConfig: ComponentPageConfig = {
  sourceFile: "response-versions.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: responseVersionsControls, render: renderResponseVersions },
  usage: [
    "Give every version a stable id — array position breaks the moment a retry lands mid-list.",
    "Auto-advance to a new version only while the reader is already on the newest one.",
    "Keep a failed version's partial text on screen; it is often still useful, and always evidence.",
    "Mark which version a branch came from — one chip, not a tree diagram.",
    "Hide the pager at one version. A 1 / 1 control teaches the reader to ignore it.",
  ],
  mistakes: [
    "Overwriting the old answer in place, so an accidental regenerate destroys a good response.",
    "Jumping the reader to the newest version while they were re-reading an older one.",
    "Treating a stopped stream as a finished answer — partial output must say it is partial.",
    "Letting compare open two identical versions because failed and generating ones were not filtered.",
  ],
};
