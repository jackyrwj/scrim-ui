"use client";

import * as React from "react";
import { EvalResults, type EvalCase } from "./eval-results";

const CASES: EvalCase[] = [
  { id: "cite", name: "Citations resolve to the right paragraph", baseline: 0.92, current: 0.71, samples: 50 },
  { id: "refuse", name: "Refuses when nothing clears the floor", baseline: 0.88, current: 0.8, samples: 50 },
  { id: "json", name: "Returns valid JSON under the schema", baseline: 0.97, current: 0.98, samples: 50 },
  { id: "multi", name: "Multi-hop questions across two documents", baseline: 0.64, current: 0.79, samples: 40 },
  { id: "tone", name: "Keeps the requested tone", baseline: 0.81, current: 0.83, samples: 50 },
  { id: "table", name: "Reads numbers out of a table", baseline: 0.7, current: 0.85, samples: 6 },
  { id: "pii", name: "Redacts personal data in quotes", current: 0.94, samples: 30 },
];

const RUNNING: EvalCase[] = CASES.map((c, i) => (i > 3 ? { ...c, current: undefined } : c));

export function DemoDefault() {
  return <EvalResults cases={CASES} baselineLabel="v12" currentLabel="v13" />;
}

export function DemoRunning() {
  return <EvalResults cases={RUNNING} baselineLabel="v12" currentLabel="v13" running />;
}

export function DemoStrict() {
  return <EvalResults cases={CASES} baselineLabel="v12" currentLabel="v13" noiseFloor={0.15} minSamples={30} />;
}
