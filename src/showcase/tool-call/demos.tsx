"use client";

import * as React from "react";
import { ToolCall } from "./tool-call";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function DemoRunning() {
  return (
    <ToolCall
      name="Search the web"
      icon={<SearchIcon />}
      status="running"
      duration="1.2s"
      input={`{\n  "query": "latest AI model releases 2026"\n}`}
      onCancel={() => {}}
    />
  );
}

export function DemoSuccess() {
  return (
    <ToolCall
      name="Search the web"
      icon={<SearchIcon />}
      status="success"
      duration="1.2s"
      defaultOpen
      input={`{\n  "query": "latest AI model releases 2026"\n}`}
      output={`{\n  "results": 12,\n  "top": [\n    "Claude Opus 5 launched with ...",\n    "Google previews Gemini 3 ..."\n  ]\n}`}
    />
  );
}

export function DemoError() {
  return (
    <ToolCall
      name="Fetch https://api.example.com/data"
      status="error"
      duration="3.1s"
      input={`{\n  "url": "https://api.example.com/data",\n  "retries": 2\n}`}
      output={`{\n  "error": "HTTP 503 Service Unavailable",\n  "status": "retry_exhausted"\n}`}
    />
  );
}

export function DemoStack() {
  return (
    <div className="space-y-2">
      <ToolCall
        name="Search GitHub API"
        status="running"
        duration="0.8s"
        input={`{\n  "q": "repo:vercel/next.js issues:open"\n}`}
        onCancel={() => {}}
      />
      <ToolCall
        name="Run tests (tests.ts)"
        status="success"
        duration="4.6s"
        defaultOpen
        input={`{"command": "npm test -- --filter=tool-call"}`}
        output={`{"passed": 8, "failed": 0, "duration": "4.6s"}`}
      />
      <ToolCall
        name="Deploy to preview"
        status="error"
        duration="11.2s"
        input={`{"environment": "preview", "branch": "feat/agent-ui"}`}
        output={`{"error": "Port 3000 already in use"}`}
      />
    </div>
  );
}
