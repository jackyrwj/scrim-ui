"use client";

import * as React from "react";
import { Reasoning } from "./reasoning";

const RESEARCH_STEPS = [
  {
    title: "Parsed the question",
    detail: "Identified the entity and the comparison dimension.",
  },
  {
    title: "Formulated search queries",
    detail: "3 queries across pricing and documentation.",
  },
  {
    title: "Scored candidate sources",
    detail: "Ranked 12 results by recency and domain authority.",
  },
  {
    title: "Synthesized the answer",
    detail: "Combined 4 sources into a single recommendation.",
  },
];

const CODING_STEPS = [
  { title: "Located the auth module" },
  { title: "Traced the token refresh flow", detail: "token.ts → refresh() → apiClient" },
  { title: "Identified the race condition", detail: "Two concurrent refreshes both read a stale token." },
  { title: "Prepared a single-flight fix" },
];

export function DemoThinking() {
  const [elapsed, setElapsed] = React.useState("0s");
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const t = window.setInterval(() => {
      setElapsed((s) => {
        const n = Number.parseInt(s) + 1;
        return `${n}s`;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <Reasoning
      isThinking
      elapsed={elapsed}
      open={open}
      onOpenChange={setOpen}
      steps={[{ title: "Formulating an approach…" }]}
      onStop={() => {}}
    />
  );
}

export function DemoComplete() {
  return <Reasoning steps={RESEARCH_STEPS} elapsed="2.1s" />;
}

export function DemoCollapsed() {
  return <Reasoning steps={RESEARCH_STEPS} elapsed="2.1s" defaultOpen={false} />;
}

export function DemoCoding() {
  return <Reasoning steps={CODING_STEPS} elapsed="4.8s" />;
}
