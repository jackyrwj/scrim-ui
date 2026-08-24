"use client";

import { ApprovalRequest, type ApprovalState } from "./approval-request";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const approvalRequestControls: ComponentControls = {
  tag: "ApprovalRequest",
  importFrom: "./approval-request",
  controls: [
    { kind: "text", name: "title", label: "Action", value: "Run database migration" },
    { kind: "text", name: "requester", label: "Requester", value: "Deploy Agent" },
    {
      kind: "text",
      name: "description",
      label: "Description",
      value:
        "Runs an irreversible migration on the production database. 4 tables, ~2 min estimated downtime.",
      multiline: true,
    },
    {
      kind: "text",
      name: "detail",
      label: "Detail (mono block)",
      value: "npm run migrate -- --env=production --confirm",
      multiline: true,
    },
    {
      kind: "enum",
      name: "status",
      label: "Status",
      value: "pending",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "denied", label: "Denied" },
      ],
    },
  ],
  handlers: ["onAllow", "onDeny"],
  presets: [
    {
      id: "pending",
      title: "Pending",
      note: "Context, the exact action, and an auto-deny countdown so requests never linger.",
      values: { status: "pending" },
    },
    {
      id: "code",
      title: "Code change",
      note: "File diffs render in a mono block so the user can judge the change before allowing.",
      values: {
        title: "Apply patch to 3 files",
        requester: "Coding Agent",
        description: "The agent wants to modify auth logic to fix the token refresh race.",
        detail:
          "- src/lib/auth/token.ts        +14 / -3\n- src/lib/auth/refresh.ts       +9  / -2\n- src/test/auth/refresh.test.ts +6  / -0",
        status: "pending",
      },
    },
    {
      id: "approved",
      title: "Approved",
      note: "Confirmation that the action ran — the agent continues from here.",
      values: {
        title: "Send email to 1,248 subscribers",
        requester: "Marketing Agent",
        description: "",
        detail: 'subject: "The AI UI Components are here"\naudience: active_subscribers\nbcc: true',
        status: "approved",
      },
    },
    {
      id: "denied",
      title: "Denied",
      note: "The action is blocked and the agent is told to find another way.",
      values: {
        title: "Refund order #48213",
        requester: "Support Agent",
        description: "Full refund of $89.00 to a card outside the 30-day window.",
        detail: "order: #48213\namount: 89.00\nreason: outside_return_window",
        status: "denied",
      },
    },
  ],
  remountOn: ["status"],
};

export function renderApprovalRequest(v: ControlValues, key: string) {
  return (
    <ApprovalRequest
      key={key}
      title={String(v.title)}
      requester={String(v.requester)}
      description={v.description ? String(v.description) : undefined}
      detail={v.detail ? String(v.detail) : undefined}
      status={v.status as ApprovalState}
      onAllow={() => {}}
      onDeny={() => {}}
    />
  );
}
