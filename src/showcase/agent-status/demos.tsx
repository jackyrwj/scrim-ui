"use client";

import * as React from "react";
import { AgentStatus } from "./agent-status";

export function DemoRunning() {
  const [progress, setProgress] = React.useState(22);
  const [elapsed, setElapsed] = React.useState("0s");

  React.useEffect(() => {
    const t = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 3));
      setElapsed((e) => {
        const n = Number.parseInt(e) + 1;
        return `${n}s`;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <AgentStatus
      name="Research Agent"
      status="running"
      action="Searching 12 sources for recent AI model releases…"
      progress={progress}
      elapsed={elapsed}
      onStop={() => {}}
    />
  );
}

export function DemoWaiting() {
  return (
    <AgentStatus
      name="Research Agent"
      status="waiting"
      action="Awaiting your approval before sending the report"
      elapsed="4.2s"
    />
  );
}

export function DemoCompleted() {
  return (
    <AgentStatus
      name="Research Agent"
      status="completed"
      action="Report ready — 12 sources, 3 findings"
      elapsed="28.4s"
    />
  );
}

export function DemoFailed() {
  return (
    <AgentStatus
      name="Deploy Agent"
      status="failed"
      action="Preview build failed at step 3 of 5"
      elapsed="11.2s"
      onRetry={() => {}}
    />
  );
}

export function DemoStack() {
  return (
    <div className="space-y-2">
      <AgentStatus
        name="Coding Agent"
        status="completed"
        action="Applied fix to token refresh race condition"
        elapsed="42.0s"
      />
      <AgentStatus
        name="Deploy Agent"
        status="failed"
        action="Preview build failed at step 3 of 5"
        elapsed="11.2s"
        onRetry={() => {}}
      />
      <AgentStatus
        name="QA Agent"
        status="waiting"
        action="Awaiting approval to run destructive migration"
        elapsed="1.4s"
      />
    </div>
  );
}
