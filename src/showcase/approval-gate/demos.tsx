"use client";

import * as React from "react";
import { ApprovalGate, type ApprovalRequest } from "./approval-gate";

/* A fixed clock. The component takes `now` precisely so a demo — or a test —
   does not have to race a real one, and a countdown rendered from Date.now()
   on the server and again in the browser is a hydration mismatch waiting for
   a slow network. */
const NOW = 1_700_000_000_000;

const REQUEST: ApprovalRequest = {
  id: "req_9f2c41",
  title: "Post a comment on issue #482",
  requester: "triage-agent",
  description: "Step 3 of 6 · the run is paused until this is answered.",
  detail: 'POST /repos/acme/api/issues/482/comments\n{ "body": "Reproduced on 16.3.3 — the offsets are dropped in chunk()." }',
  expiresAt: NOW + 272_000,
};

export function DemoDefault() {
  return <ApprovalGate request={REQUEST} now={NOW} />;
}

export function DemoSubmitting() {
  return <ApprovalGate request={REQUEST} submitting="approved" now={NOW} />;
}

export function DemoDecidedElsewhere() {
  return (
    <ApprovalGate
      request={REQUEST}
      outcome={{ decision: "approved", decidedBy: "dana@acme.com", at: NOW - 41_000 }}
      now={NOW}
    />
  );
}

export function DemoExpired() {
  return (
    <ApprovalGate request={{ ...REQUEST, expiresAt: NOW - 154_000 }} now={NOW} />
  );
}

export function DemoStale() {
  return (
    <ApprovalGate
      request={{ ...REQUEST, expiresAt: NOW - 154_000 }}
      outcome={{ decision: "approved", decidedBy: "you", at: NOW - 9_000, stale: true }}
      now={NOW}
    />
  );
}

export function DemoReconnecting() {
  return <ApprovalGate request={REQUEST} connection="reconnecting" now={NOW} />;
}
