"use client";

import { ReasoningSteps } from "./reasoning-steps";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const STEPS = [
  "Parsing your question",
  "Planning the search",
  "Querying three sources",
  "Extracting citations",
  "Writing the answer",
].join("\n");

const parse = (t: string) => t.split("\n").map((s) => s.trim()).filter(Boolean);

export const reasoningStepsControls: ComponentControls = {
  tag: "ReasoningSteps",
  importFrom: "./reasoning-steps",
  controls: [
    { kind: "text", name: "title", label: "Title", value: "Reasoning" },
    { kind: "text", name: "steps", label: "Steps (one per line)", value: STEPS, multiline: true },
    { kind: "number", name: "activeStep", label: "Active step", value: 2, min: 0, max: 8 },
    { kind: "text", name: "elapsed", label: "Elapsed", value: "3.2s" },
    { kind: "boolean", name: "defaultExpanded", label: "Expanded", value: true },
  ],
  derive: (v) => {
    const steps = parse(String(v.steps));
    return {
      preamble: `const STEPS = [\n${steps.map((s) => `  ${JSON.stringify(s)},`).join("\n")}\n];`,
      props: { steps: "STEPS" },
    };
  },
  presets: [
    {
      id: "expanded",
      title: "Expanded",
      note: "Finished steps show a check, the running one a spinner, later ones stay dim.",
      values: { activeStep: 2, defaultExpanded: true, elapsed: "3.2s" },
    },
    {
      id: "collapsed",
      title: "Collapsed",
      note: "The resting state — a compact header with the step count and elapsed time.",
      values: { activeStep: 2, defaultExpanded: false, elapsed: "3.2s" },
    },
    {
      id: "running",
      title: "Late in the run",
      note: "The header keeps the full count while the active step carries the timer.",
      values: { activeStep: 4, defaultExpanded: true, elapsed: "9.6s" },
    },
  ],
  remountOn: ["defaultExpanded"],
};

export function renderReasoningSteps(v: ControlValues, key: string) {
  return (
    <ReasoningSteps
      key={key}
      title={String(v.title)}
      steps={parse(String(v.steps))}
      activeStep={Number(v.activeStep)}
      elapsed={String(v.elapsed)}
      defaultExpanded={Boolean(v.defaultExpanded)}
    />
  );
}
