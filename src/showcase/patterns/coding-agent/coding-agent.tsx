"use client";

import * as React from "react";
import { AgentStatus } from "../../agent-status/agent-status";
import { ToolCall } from "../../tool-call/tool-call";
import { ApprovalRequest } from "../../approval-request/approval-request";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="m4 17 6-6-6-6M12 19h8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diff block                                                          */
/* ------------------------------------------------------------------ */

function DiffBlock() {
  const lines = [
    { type: "hunk", text: "@@ -24,7 +24,8 @@ function refresh() {" },
    { type: "ctx", text: "   const token = await readStoredToken();" },
    { type: "del", text: "-  const { access, expiresAt } = await refreshToken(token);" },
    { type: "add", text: "+  const result = await refreshWithSingleFlight(token);" },
    { type: "ctx", text: "   if (isExpired(result.expiresAt)) throw new TokenError();" },
    { type: "add", text: "+  // Only the first caller refreshes; the rest wait on the same promise." },
    { type: "ctx", text: "   return result.access;" },
  ];
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 dark:border-zinc-700">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 dark:border-zinc-700">
        <FileIcon />
        src/lib/auth/token.ts
        <span className="ml-auto tabular-nums">+2 −1</span>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-5">
        {lines.map((l, i) => (
          <span
            key={i}
            className={`block ${
              l.type === "add"
                ? "bg-emerald-950/50 text-emerald-300"
                : l.type === "del"
                  ? "bg-red-950/50 text-red-300"
                  : l.type === "hunk"
                    ? "text-zinc-500"
                    : "text-zinc-300"
            }`}
          >
            {l.text}
          </span>
        ))}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CodingAgentPattern                                                  */
/* ------------------------------------------------------------------ */

export function CodingAgentPattern() {
  const [approved, setApproved] = React.useState(false);

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Task</p>
        <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Fix the token refresh race condition
        </h3>
      </div>

      {/* Agent status */}
      <AgentStatus
        name="Coding Agent"
        status={approved ? "completed" : "running"}
        action={
          approved
            ? "Applied fix and re-ran the full auth suite"
            : "Analyzing token lifecycle, then applying patch to 3 files"
        }
        elapsed={approved ? "42.0s" : "18.6s"}
        progress={approved ? 100 : 64}
        onStop={() => {}}
      />

      {/* Tool calls */}
      <div className="space-y-2">
        <ToolCall
          name="Run auth tests (auth.test.ts)"
          icon={<TerminalIcon />}
          status="success"
          duration="4.6s"
          defaultOpen
          input={`{"command": "npm test -- --filter=auth"}`}
          output={`{"passed": 8, "failed": 1, "skipped": 0}`}
        />
        <ToolCall
          name="Read source (token.ts)"
          icon={<FileIcon />}
          status="success"
          duration="0.3s"
          input={`{"file": "src/lib/auth/token.ts", "range": "1-60"}`}
        />
      </div>

      {/* Diff */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Proposed change</p>
        <DiffBlock />
      </div>

      {/* Approval */}
      <ApprovalRequest
        title="Apply patch and run migration?"
        requester="Coding Agent"
        description="Applies the fix to 3 files and re-runs the auth suite against the staging database."
        detail={`- src/lib/auth/token.ts\n- src/lib/auth/refresh.ts\n- src/test/auth/refresh.test.ts`}
        status={approved ? "approved" : "pending"}
        onAllow={() => setApproved(true)}
        onDeny={() => setApproved(false)}
      />

      {/* Completion */}
      {approved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckIcon />
          <span className="font-medium">Task completed.</span>
          <span className="text-emerald-700/80 dark:text-emerald-400/80">
            All 9 tests pass. The race is resolved with single-flight refresh.
          </span>
        </div>
      )}
    </div>
  );
}
