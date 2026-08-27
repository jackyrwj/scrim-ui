"use client";

import * as React from "react";
import { ApprovalGate, type ApprovalDecision, type ApprovalRequest } from "./approval-gate";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const NOW = 1_700_000_000_000;

const REQUEST: ApprovalRequest = {
  id: "req_9f2c41",
  title: "Post a comment on issue #482",
  requester: "triage-agent",
  description: "Step 3 of 6 · the run is paused until this is answered.",
  detail: 'POST /repos/acme/api/issues/482/comments\n{ "body": "Reproduced on 16.3.3 — the offsets are dropped in chunk()." }',
  expiresAt: NOW + 272_000,
};

const PREAMBLE = `const request = {
  id: "req_9f2c41",                       // idempotency key — send it with the decision
  title: "Post a comment on issue #482",
  requester: "triage-agent",
  description: "Step 3 of 6 · the run is paused until this is answered.",
  detail: 'POST /repos/acme/api/issues/482/comments\\n{ "body": "…" }',
  expiresAt: Date.now() + 272_000,
};`;

/**
 * The states here are not prop sets so much as *positions in a lifecycle*, and
 * three of the five are things the server said rather than things this tab
 * did. So the snippet is written per state: the point being made is which
 * props come from the run's event stream, and a generated attribute list
 * makes `outcome` look like something a click handler sets.
 */
export const approvalGateControls: ComponentControls = {
  tag: "ApprovalGate",
  importFrom: "./approval-gate",
  controls: [
    {
      kind: "enum",
      name: "state",
      label: "Lifecycle position",
      value: "pending",
      options: [
        { value: "pending", label: "Pending" },
        { value: "submitting", label: "Decision in flight" },
        { value: "elsewhere", label: "Decided in another tab" },
        { value: "expired", label: "Expired unanswered" },
        { value: "stale", label: "Answered too late" },
      ],
    },
    {
      kind: "enum",
      name: "connection",
      label: "Event stream",
      value: "live",
      options: [
        { value: "live", label: "Live" },
        { value: "reconnecting", label: "Reconnecting" },
        { value: "offline", label: "Offline" },
      ],
    },
    { kind: "boolean", name: "detail", label: "Show the exact payload", value: true },
  ],
  snippet: (v) => {
    const lines: string[] = [PREAMBLE, ""];
    switch (v.state) {
      case "pending":
        lines.push(
          "// `outcome` is undefined: the run has not told us anything yet.",
          "<ApprovalGate",
          "  request={request}",
          `  connection={${JSON.stringify(v.connection)}}`,
          "  onDecide={(decision, id) => submitDecision(id, decision)}",
          "/>",
        );
        break;
      case "submitting":
        lines.push(
          "// Local, and only local. Set on send, cleared when the OUTCOME arrives",
          "// on the stream — not when the fetch resolves.",
          "<ApprovalGate request={request} submitting=\"approved\" onDecide={submit} />",
        );
        break;
      case "elsewhere":
        lines.push(
          "// Straight from the event log. Identical in every tab, and identical",
          "// after a reload — which is what makes the closed-tab case a non-event.",
          "<ApprovalGate",
          "  request={request}",
          '  outcome={{ decision: "approved", decidedBy: "dana@acme.com", at: 1700000000000 }}',
          "/>",
        );
        break;
      case "expired":
        lines.push(
          "// Nothing was clicked and the deadline passed. Derived from",
          "// request.expiresAt, so it is true on a reload months later.",
          "<ApprovalGate request={{ ...request, expiresAt: Date.now() - 154_000 }} />",
        );
        break;
      case "stale":
        lines.push(
          "// The click was real, the answer is recorded, and the action did not",
          "// run. `stale` is the server's word, and the only honest render.",
          "<ApprovalGate",
          "  request={{ ...request, expiresAt: Date.now() - 154_000 }}",
          '  outcome={{ decision: "approved", decidedBy: "you", stale: true }}',
          "/>",
        );
        break;
    }
    return lines.join("\n") + "\n";
  },
  presets: [
    {
      id: "pending",
      title: "Pending",
      note: "The run is blocked. The countdown is the run's deadline, not a UI animation — it is why the other four states exist.",
      values: { state: "pending", connection: "live", detail: true },
    },
    {
      id: "submitting",
      title: "In flight",
      note: "Clicked, sent, unconfirmed. The buttons go inert instead of disappearing, because the answer is not the click — it is the run agreeing.",
      values: { state: "submitting", connection: "live", detail: true },
    },
    {
      id: "elsewhere",
      title: "Decided in another tab",
      note: "The same run, open twice. This tab never clicked anything and shows the decision anyway, because the outcome is the run's, not the tab's.",
      values: { state: "elsewhere", connection: "live", detail: true },
    },
    {
      id: "expired",
      title: "Expired unanswered",
      note: "Nobody answered in time. The run moved on without acting, and the card says which of those two things happened.",
      values: { state: "expired", connection: "live", detail: false },
    },
    {
      id: "stale",
      title: "Answered too late",
      note: "The one a green tick would lie about. The decision was recorded; the action never ran.",
      values: { state: "stale", connection: "live", detail: true },
    },
    {
      id: "reconnecting",
      title: "Stream reconnecting",
      note: "Still clickable — but this tab is no longer authoritative about whether it has already been decided, and says so.",
      values: { state: "pending", connection: "reconnecting", detail: true },
    },
  ],
};

export function renderApprovalGate(v: ControlValues, key: string) {
  const request: ApprovalRequest = {
    ...REQUEST,
    detail: v.detail ? REQUEST.detail : undefined,
    expiresAt: v.state === "expired" || v.state === "stale" ? NOW - 154_000 : NOW + 272_000,
  };

  const outcome =
    v.state === "elsewhere"
      ? { decision: "approved" as ApprovalDecision, decidedBy: "dana@acme.com", at: NOW - 41_000 }
      : v.state === "stale"
        ? { decision: "approved" as ApprovalDecision, decidedBy: "you", at: NOW - 9_000, stale: true }
        : undefined;

  return (
    <ApprovalGate
      key={key}
      request={request}
      outcome={outcome}
      submitting={v.state === "submitting" ? "approved" : undefined}
      connection={String(v.connection) as "live" | "reconnecting" | "offline"}
      now={NOW}
    />
  );
}
