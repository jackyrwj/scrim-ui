"use client";

import { ReasoningSteps } from "./reasoning-steps";

const STEPS = [
  "Parsing your question",
  "Planning the search",
  "Querying three sources",
  "Extracting citations",
  "Writing the answer",
];

export function DemoCollapsed() {
  return <ReasoningSteps steps={STEPS} activeStep={1} elapsed="0.9s" defaultExpanded={false} />;
}

export function DemoExpanded() {
  return <ReasoningSteps steps={STEPS} activeStep={2} elapsed="1.9s" defaultExpanded />;
}

export function DemoRunning() {
  return <ReasoningSteps steps={STEPS} activeStep={4} elapsed="4.6s" defaultExpanded />;
}
