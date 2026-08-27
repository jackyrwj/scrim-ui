"use client";

import * as React from "react";
import { EvalResults, type EvalCase } from "./eval-results";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const CASES: EvalCase[] = [
  { id: "cite", name: "Citations resolve to the right paragraph", baseline: 0.92, current: 0.71, samples: 50 },
  { id: "refuse", name: "Refuses when nothing clears the floor", baseline: 0.88, current: 0.8, samples: 50 },
  { id: "json", name: "Returns valid JSON under the schema", baseline: 0.97, current: 0.98, samples: 50 },
  { id: "multi", name: "Multi-hop questions across two documents", baseline: 0.64, current: 0.79, samples: 40 },
  { id: "tone", name: "Keeps the requested tone", baseline: 0.81, current: 0.83, samples: 50 },
  { id: "table", name: "Reads numbers out of a table", baseline: 0.7, current: 0.85, samples: 6 },
  { id: "pii", name: "Redacts personal data in quotes", current: 0.94, samples: 30 },
];

const PREAMBLE = `const CASES = [
  { id: "cite",   name: "Citations resolve to the right paragraph", baseline: 0.92, current: 0.71, samples: 50 },
  { id: "table",  name: "Reads numbers out of a table",             baseline: 0.70, current: 0.85, samples: 6  },
  { id: "pii",    name: "Redacts personal data in quotes",                          current: 0.94, samples: 30 }, // new case
  // …
];`;

export const evalResultsControls: ComponentControls = {
  tag: "EvalResults",
  importFrom: "./eval-results",
  controls: [
    { kind: "text", name: "baselineLabel", label: "Baseline column", value: "v12" },
    { kind: "text", name: "currentLabel", label: "Current column", value: "v13" },
    { kind: "number", name: "noiseFloor", label: "Noise floor", value: 0.05, min: 0, max: 0.5, step: 0.01 },
    { kind: "number", name: "minSamples", label: "Minimum samples to call a delta", value: 10, min: 1, max: 100, step: 1 },
    { kind: "boolean", name: "running", label: "Run still in flight", value: false },
  ],
  snippet: (v) => {
    const props = [
      "  cases={CASES}",
      `  baselineLabel="${v.baselineLabel}"`,
      `  currentLabel="${v.currentLabel}"`,
      `  noiseFloor={${v.noiseFloor}}`,
      `  minSamples={${v.minSamples}}`,
      v.running ? "  running" : null,
    ].filter(Boolean);
    return `${PREAMBLE}\n\n<EvalResults\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "summary",
      title: "Two runs compared",
      note: "Regressions first — the two rows the page was opened for should not be somewhere in the middle of an alphabetical list.",
      values: { noiseFloor: 0.05, minSamples: 10, running: false },
    },
    {
      id: "strict",
      title: "Honest thresholds",
      note: "A wider noise floor and a higher sample minimum. Most of the movement stops being reportable, which is usually the truth.",
      values: { noiseFloor: 0.15, minSamples: 30, running: false },
    },
    {
      id: "running",
      title: "Mid-run",
      note: "The mean is over reported cases only and says so. Averaging an unfinished case as zero produces a number that improves as the run proceeds.",
      values: { noiseFloor: 0.05, minSamples: 10, running: true },
    },
  ],
};

export function renderEvalResults(v: ControlValues, key: string) {
  const cases = v.running ? CASES.map((c, i) => (i > 3 ? { ...c, current: undefined } : c)) : CASES;
  return (
    <EvalResults
      key={key}
      cases={cases}
      baselineLabel={String(v.baselineLabel)}
      currentLabel={String(v.currentLabel)}
      noiseFloor={Number(v.noiseFloor)}
      minSamples={Number(v.minSamples)}
      running={Boolean(v.running)}
    />
  );
}
