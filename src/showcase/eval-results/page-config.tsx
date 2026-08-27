import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { evalResultsControls, renderEvalResults } from "./controls";

export const evalResultsPageConfig: ComponentPageConfig = {
  sourceFile: "eval-results.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: evalResultsControls, render: renderEvalResults },
  usage: [
    "Set `noiseFloor` from a repeated run of the same version against itself, not from taste. Whatever that spread is, everything under it is weather.",
    "Carry the sample count per case and show it. A delta over six samples and a delta over five hundred look identical in a table and mean nothing alike.",
    "Sort regressions to the top. Alphabetical order buries the rows that are the reason anyone opened the page.",
    "Leave `baseline` undefined for a case that did not exist last run. A new case is not an improvement, and rendering it as one makes a growing suite look like a better model.",
    "Compute the mean over reported cases only while a run is in flight, and label it that way.",
    "Keep the pass rate a rate, not a boolean. Non-deterministic systems do not have passing tests, they have passing proportions.",
  ],
  mistakes: [
    "Colouring every delta. Green arrows on movement that is inside the noise are how a team ships a regression on a Friday feeling good about it.",
    "Averaging unfinished cases as zero. The headline number then climbs steadily as the run proceeds for reasons unrelated to the model.",
    "Showing a new case as +100%. It rewards adding easy tests, which is the last incentive an eval suite should have.",
    "Hiding cases that have not reported yet. The suite looks smaller and greener than it is, and nobody notices which cases are missing.",
    "Reporting a single overall score with no per-case breakdown. It moves, and nobody can say why or what to fix.",
  ],
};
