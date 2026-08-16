"use client";

import * as React from "react";
import { ApprovalRequest } from "./approval-request";

export function DemoPending() {
  const [status, setStatus] = React.useState<"pending" | "approved" | "denied">("pending");
  return (
    <ApprovalRequest
      title="Run database migration"
      requester="Deploy Agent"
      description="Runs an irreversible migration on the production database. 4 tables, ~2 min estimated downtime."
      detail={`npm run migrate -- --env=production --confirm`}
      status={status}
      onAllow={() => setStatus("approved")}
      onDeny={() => setStatus("denied")}
    />
  );
}

export function DemoCode() {
  const [status, setStatus] = React.useState<"pending" | "approved" | "denied">("pending");
  return (
    <ApprovalRequest
      title="Apply patch to 3 files"
      requester="Coding Agent"
      description="The agent wants to modify auth logic to fix the token refresh race."
      detail={`- src/lib/auth/token.ts        +14 / -3\n- src/lib/auth/refresh.ts       +9  / -2\n- src/test/auth/refresh.test.ts +6  / -0`}
      status={status}
      onAllow={() => setStatus("approved")}
      onDeny={() => setStatus("denied")}
    />
  );
}

export function DemoApproved() {
  return (
    <ApprovalRequest
      title="Send email to 1,248 subscribers"
      requester="Marketing Agent"
      status="approved"
      detail={`subject: "The AI UI Components are here"\naudience: active_subscribers\nbcc: true`}
    />
  );
}

export function DemoDenied() {
  return (
    <ApprovalRequest
      title="Refund order #48213"
      requester="Support Agent"
      status="denied"
      description="Full refund of $89.00 to a card outside the 30-day window."
      detail={`order: #48213\namount: 89.00\nreason: outside_return_window`}
    />
  );
}
