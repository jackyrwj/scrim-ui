"use client";

import * as React from "react";
import { AgentStatus, type AgentState } from "../../agent-status/agent-status";
import { AgentHandoff, type HandoffState } from "../../agent-handoff/agent-handoff";
import { AgentRunTimeline, type RunEvent } from "../../agent-run-timeline/agent-run-timeline";

/**
 * An operations console for several agents running in parallel.
 *
 * What this pattern exists to show:
 *
 * 1. **The roster answers "who's doing what" in one glance.** Each agent is
 *    a status card; selecting one swaps the timeline, never the page.
 * 2. **A handoff is a first-class event with a context receipt.** What was
 *    carried across — and what was deliberately not — is inspectable where
 *    the handoff happened.
 * 3. **Approval waits at fleet level.** The console header counts pending
 *    approvals across every agent; the gate itself stays inline in the
 *    owning agent's log.
 * 4. **A failed child run is one card, not an outage.** The Billing agent
 *    failed; Research and Writer carry on. Rerun is per-agent.
 * 5. **Cost is per-run and in aggregate.** The header sums the fleet; each
 *    agent's timeline keeps its own meter.
 *
 * Pro boundary: the Cost Meter and Approval Gate components stay Pro — this
 * pattern composes only free components; cost rides the timeline summary.
 */

/* ------------------------------------------------------------------ */
/* Mock fleet                                                          */
/* ------------------------------------------------------------------ */

type Agent = {
  id: string;
  name: string;
  state: AgentState;
  action: string;
  cost: string;
  tokens: number;
  events: RunEvent[];
  handoff?: { to: string; task: string; carried: string[]; withheld: string[]; state: HandoffState };
};

const FLEET: Agent[] = [
  {
    id: "research",
    name: "Researcher",
    state: "running",
    action: "Searching vendor contracts…",
    cost: "$0.07",
    tokens: 12_300,
    events: [
      { id: "r1", kind: "model", title: "Scoped the renewal question", at: "09:41:02", status: "completed", durationMs: 2400 },
      { id: "r2", kind: "tool", title: "search_docs(\"acme renewal terms\")", detail: "6 passages retrieved", at: "09:41:05", status: "completed", durationMs: 1700 },
      { id: "r3", kind: "tool", title: "search_docs(\"acme SLA history\")", detail: "3 passages retrieved", at: "09:41:08", status: "completed", durationMs: 1400 },
      { id: "r4", kind: "tool", title: "read_file(\"contracts/acme-2026.pdf\")", at: "09:41:12", status: "completed", durationMs: 820 },
      { id: "r5", kind: "model", title: "Comparing renewal clause against SLA log", at: "09:41:15", status: "running" },
    ],
  },
  {
    id: "writer",
    name: "Writer",
    state: "waiting",
    action: "Waiting on approval to send",
    cost: "$0.03",
    tokens: 5_100,
    handoff: {
      to: "Writer",
      task: "Draft the renewal summary email for the account manager",
      carried: ["Renewal clause excerpt (p.4)", "SLA breach count: 2", "Account tone: formal"],
      withheld: ["Internal pricing floor", "Legal's escalation notes"],
      state: "accepted",
    },
    events: [
      { id: "w1", kind: "handoff", title: "Accepted task from Researcher", detail: "Draft the renewal summary email", at: "09:40:12", status: "completed" },
      { id: "w2", kind: "model", title: "Drafted email v1", at: "09:40:31", status: "completed", durationMs: 5100 },
      { id: "w3", kind: "model", title: "Tightened subject line", at: "09:40:39", status: "completed", durationMs: 1300 },
      { id: "w4", kind: "approval", title: "Send email to account manager", detail: "External recipient — cannot be unsent", at: "09:40:41", status: "waiting" },
    ],
  },
  {
    id: "billing",
    name: "Billing",
    state: "failed",
    action: "Child run failed — payment API timeout",
    cost: "$0.01",
    tokens: 1_900,
    events: [
      { id: "b1", kind: "tool", title: "read_file(\"invoices/q3.json\")", at: "09:38:44", status: "completed", durationMs: 510 },
      { id: "b2", kind: "tool", title: "charge_customer(acme, 4820)", detail: "Payment API timeout after 5s", at: "09:38:50", status: "failed", durationMs: 5000 },
      { id: "b3", kind: "error", title: "Child run aborted", detail: "1 of 3 steps completed — no charge was made", at: "09:38:50", status: "failed" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Pattern                                                             */
/* ------------------------------------------------------------------ */

export function AgentConsolePattern() {
  const [agents, setAgents] = React.useState<Agent[]>(FLEET);
  const [selectedId, setSelectedId] = React.useState("writer");
  const [decisions, setDecisions] = React.useState<Record<string, "approved" | "rejected">>({});

  const selected = agents.find((a) => a.id === selectedId) ?? agents[0];
  const pendingApprovals = agents.reduce(
    (n, a) => n + a.events.filter((e) => e.kind === "approval" && e.status === "waiting" && !decisions[e.id]).length,
    0,
  );
  const totalTokens = agents.reduce((s, a) => s + a.tokens, 0);

  function decide(agentId: string, eventId: string, approved: boolean) {
    setDecisions((d) => ({ ...d, [eventId]: approved ? "approved" : "rejected" }));
    setAgents((as) =>
      as.map((a) =>
        a.id !== agentId
          ? a
          : {
              ...a,
              state: approved ? "completed" : "failed",
              action: approved ? "Email sent — run complete" : "Approval rejected — run ended",
              events: a.events.map((e) =>
                e.id === eventId
                  ? { ...e, status: approved ? "completed" : "cancelled", detail: approved ? "Approved by you — sending now" : "Rejected by you" }
                  : e,
              ),
            },
      ),
    );
  }

  function rerun(agentId: string) {
    setAgents((as) =>
      as.map((a) =>
        a.id !== agentId
          ? a
          : {
              ...a,
              state: "running",
              action: "Retrying charge…",
              events: [
                ...a.events,
                { id: "b4", kind: "tool", title: "charge_customer(acme, 4820)", detail: "Retry after timeout", at: "09:44:01", status: "running", retryOf: "b2" },
              ],
            },
      ),
    );
    window.setTimeout(() => {
      setAgents((as) =>
        as.map((a) =>
          a.id !== agentId
            ? a
            : {
                ...a,
                state: "completed",
                action: "Charge succeeded on retry",
                cost: "$0.02",
                tokens: a.tokens + 800,
                events: a.events.map((e) =>
                  e.id === "b4" ? { ...e, status: "completed", durationMs: 1900, detail: "Succeeded on retry" } : e,
                ),
              },
        ),
      );
    }, 2200);
  }

  return (
    <div className="flex h-[640px] overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Fleet roster */}
      <aside className="hidden w-64 shrink-0 flex-col gap-2 overflow-y-auto border-r border-zinc-200 p-3 dark:border-zinc-800 md:flex">
        <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Fleet · {agents.length} agents</p>
        {agents.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelectedId(a.id)}
            aria-current={a.id === selectedId ? "true" : undefined}
            className={`rounded-xl text-left transition-shadow ${
              a.id === selectedId ? "ring-2 ring-zinc-900 dark:ring-zinc-100" : "hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-700"
            }`}
          >
            <AgentStatus name={a.name} status={a.state} action={a.action} />
          </button>
        ))}
        <div className="mt-auto rounded-xl bg-zinc-50 px-3 py-2 text-[11px] leading-5 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
          <p className="font-medium text-zinc-700 dark:text-zinc-200">Fleet total</p>
          <p className="tabular-nums">{totalTokens.toLocaleString()} tokens · $0.11</p>
          {pendingApprovals > 0 && (
            <p className="font-medium text-amber-600 dark:text-amber-400">
              {pendingApprovals} approval{pendingApprovals === 1 ? "" : "s"} pending
            </p>
          )}
        </div>
      </aside>

      {/* Selected agent */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{selected.name}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {selected.tokens.toLocaleString()} tokens · {selected.cost} this run
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              aria-label="Select agent"
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:hidden"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {selected.state === "failed" && (
              <button
                type="button"
                onClick={() => rerun(selected.id)}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Rerun failed step
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {selected.handoff && (
            <AgentHandoff
              from="Researcher"
              to={selected.handoff.to}
              task={selected.handoff.task}
              carried={selected.handoff.carried}
              withheld={selected.handoff.withheld}
              state={selected.handoff.state}
              reason="Drafting needs a writing specialist, not another search pass."
            />
          )}
          <AgentRunTimeline
            className="h-full min-h-[300px]"
            events={selected.events}
            onApprove={(eid) => decide(selected.id, eid, true)}
            onReject={(eid) => decide(selected.id, eid, false)}
            summary={{ tokens: selected.tokens, cost: selected.cost, elapsed: "2m 14s" }}
          />
        </div>
      </div>
    </div>
  );
}
