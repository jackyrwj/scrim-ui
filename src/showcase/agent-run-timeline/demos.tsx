"use client";

import * as React from "react";
import { AgentRunTimeline, type RunEvent } from "./agent-run-timeline";

const SCRIPT: Omit<RunEvent, "status">[] = [
  { id: "e1", kind: "model", title: "Planner drafted 6-step plan", at: "14:02:03" },
  { id: "e2", kind: "tool", title: "search_docs(\"refund policy\")", detail: "4 passages retrieved", at: "14:02:05" },
  { id: "e3", kind: "tool", title: "read_file(\"orders/1042.json\")", at: "14:02:07" },
  { id: "e4", kind: "model", title: "Drafted refund summary", at: "14:02:10" },
  { id: "e5", kind: "tool", title: "search_docs(\"warranty terms\")", detail: "2 passages retrieved", at: "14:02:13" },
  { id: "e6", kind: "tool", title: "read_file(\"customers/jdoe.json\")", at: "14:02:15" },
  { id: "e7", kind: "model", title: "Cross-checked eligibility", at: "14:02:18" },
  { id: "e8", kind: "tool", title: "update_order(1042, refund=true)", detail: "API timeout after 5s", at: "14:02:24" },
  { id: "e9", kind: "tool", title: "update_order(1042, refund=true)", detail: "Succeeded on second attempt", at: "14:02:31", retryOf: "e8" },
  { id: "e10", kind: "handoff", title: "Handoff to Billing agent", detail: "Context: refund approved for order 1042", at: "14:02:33" },
  { id: "e11", kind: "approval", title: "Issue $48.20 refund to card •• 4242", detail: "Irreversible — charges the customer account", at: "14:02:35" },
];

const DURATIONS = [3200, 1800, 640, 2100, 1500, 420, 2600, 5000, 1100, 300, 0];

/** A run that replays itself: events land one by one, e8 fails, e9 retries
 *  it, then the run parks on a waiting approval. */
export function InteractiveTimeline() {
  const [events, setEvents] = React.useState<RunEvent[]>([]);
  const [decision, setDecision] = React.useState<"approved" | "rejected" | null>(null);

  React.useEffect(() => {
    const timers: number[] = [];
    SCRIPT.forEach((e, i) => {
      timers.push(
        window.setTimeout(() => {
          setEvents((ev) => [
            ...ev.map((x) => (x.status === "running" ? { ...x, status: "completed" as const } : x)),
            {
              ...e,
              status: e.id === "e8" ? "failed" : e.id === "e11" ? "waiting" : "completed",
              durationMs: DURATIONS[i] || undefined,
            },
          ]);
        }, 500 + i * 750),
      );
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const displayed = decision
    ? events.map((e) =>
        e.id === "e11"
          ? { ...e, status: "completed" as const, detail: decision === "approved" ? "Approved by you — refund issued" : "Rejected by you — run ended" }
          : e,
      )
    : events;

  return (
    <div className="flex h-[460px] flex-col p-4">
      <AgentRunTimeline
        className="flex-1"
        events={displayed}
        onApprove={() => setDecision("approved")}
        onReject={() => setDecision("rejected")}
        summary={{ elapsed: "38s", tokens: 18_420, cost: "$0.11" }}
      />
    </div>
  );
}

export function DemoDefault() {
  return <InteractiveTimeline />;
}
