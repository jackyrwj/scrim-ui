"use client";

import * as React from "react";
import { SourceCard } from "./source-card";

const SOURCES = [
  {
    title: "Claude 5: A new era of AI capability",
    url: "https://www.anthropic.com/news/claude-fable-5-mythos-5",
    snippet:
      "Claude Fable 5 and Mythos 5 share the same underlying model, with Fable 5 adding safety measures for dual-use capabilities.",
  },
  {
    title: "State of the AI UI stack in 2026",
    url: "https://example.com/ai-ui-stack",
    snippet:
      "A survey of how teams are composing prompt inputs, agent states and streaming UIs across frameworks.",
  },
  {
    title: "Designing human-in-the-loop approvals",
    url: "https://example.com/hitl-approvals",
    snippet:
      "Why approval requests need context, cost preview and an escape hatch before an agent acts.",
  },
  {
    title: "Tool call UX: trust through transparency",
    url: "https://example.com/tool-call-ux",
    snippet:
      "The interaction patterns that make agent tool usage legible — and the ones that break trust.",
  },
];

export function DemoDefault() {
  return (
    <div className="space-y-2">
      <SourceCard {...SOURCES[0]} index={1} />
      <SourceCard {...SOURCES[1]} index={2} />
      <SourceCard {...SOURCES[2]} index={3} />
    </div>
  );
}

export function DemoCompact() {
  return <SourceCard title="Designing human-in-the-loop approvals" url="https://example.com/hitl-approvals" />;
}

export function DemoWithSnippet() {
  return <SourceCard {...SOURCES[0]} />;
}

export function DemoGrid() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {SOURCES.map((s, i) => (
        <SourceCard key={i} {...s} index={i + 1} />
      ))}
    </div>
  );
}
