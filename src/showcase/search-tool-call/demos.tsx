"use client";

import * as React from "react";
import { SearchToolCall, type SearchResult } from "./search-tool-call";

const RESULTS: SearchResult[] = [
  {
    title: "Claude Fable 5 and Mythos 5 — Anthropic",
    url: "https://www.anthropic.com/news/claude-fable-5-mythos-5",
    snippet: "Fable 5 is the most advanced generally available Claude model to date.",
  },
  {
    title: "Claude 5 family: model overview",
    url: "https://docs.anthropic.com/models/overview",
    snippet: "Capabilities, context windows and pricing for the Claude 5 line.",
  },
  {
    title: "Mythos class: safety and access",
    url: "https://example.com/mythos-access",
    snippet: "How the restricted-tier models differ and who can access them.",
  },
];

export function DemoSearching() {
  return (
    <SearchToolCall
      query="latest Claude 5 model release"
      status="searching"
      elapsed="1.2s"
      onStop={() => {}}
    />
  );
}

export function DemoDone() {
  return <SearchToolCall query="latest Claude 5 model release" status="done" results={RESULTS} elapsed="2.4s" />;
}

export function DemoError() {
  return (
    <SearchToolCall query="latest Claude 5 model release" status="error" elapsed="6.0s" onRetry={() => {}} />
  );
}

export function DemoLive() {
  const [status, setStatus] = React.useState<"searching" | "done" | "error">("searching");
  const [elapsed, setElapsed] = React.useState("0s");

  React.useEffect(() => {
    const tick = window.setInterval(() => {
      setElapsed((e) => `${Number.parseInt(e) + 1}s`);
    }, 1000);
    const finish = window.setTimeout(() => setStatus("done"), 3200);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(finish);
    };
  }, []);

  return (
    <SearchToolCall
      query="AI streaming UI best practices"
      status={status}
      results={RESULTS}
      elapsed={elapsed}
      onStop={() => setStatus("done")}
    />
  );
}
