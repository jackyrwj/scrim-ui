"use client";

import * as React from "react";
import { DEFAULT_MODEL, MODELS, modelName } from "@/lib/models";
import { addUsage, costOf, formatCost, formatTokens, totalTokens, ZERO_USAGE, type Usage } from "@/lib/cost";
import { useRun, useRunList } from "./use-run";
import { StepCard } from "./step-card";
import { AgentStatus } from "./ui/agent-status";
import { ErrorMessage } from "./ui/error-message";

/**
 * The console.
 *
 * Worth noticing what this component does NOT hold: no steps, no status, no
 * approval state, no "is it running" boolean. All of it comes from `useRun`,
 * which folds the server's event log. The only state here is what the user is
 * typing and which run they are looking at — the two things that genuinely
 * belong to this tab and should not survive a reload.
 *
 * That is the difference between a console and a log viewer. A run outlives
 * the page: it can be watched from two tabs, approved from a phone while a
 * laptop sleeps, and picked back up an hour later with every step intact.
 */
export function Console() {
  const [runId, setRunId] = React.useState<string | null>(null);
  const [goal, setGoal] = React.useState("");
  const [model, setModel] = React.useState(DEFAULT_MODEL);
  const [starting, setStarting] = React.useState(false);
  const [busyApproval, setBusyApproval] = React.useState<string | null>(null);

  const run = useRun(runId);
  const { runs, refresh } = useRunList();

  const busy = runId !== null && run.status === "running";

  async function start(event: React.FormEvent) {
    event.preventDefault();
    if (!goal.trim() || starting) return;
    setStarting(true);
    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, model }),
      });
      const data: { id?: string; error?: string } = await response.json();
      if (data.id) {
        setRunId(data.id);
        setGoal("");
        refresh();
      }
    } finally {
      setStarting(false);
    }
  }

  async function approve(approvalId: string, approved: boolean) {
    setBusyApproval(approvalId);
    try {
      await run.actions.approve(approvalId, approved);
    } finally {
      /* Cleared when the request settles, not when the UI changes — the card
         itself is redrawn by the `approval-responded` event coming back down
         the stream, which is what makes the second tab agree. */
      setBusyApproval(null);
    }
  }

  /* The running total. Summed from the steps rather than tracked separately,
     so a re-run that discards steps 3 onwards also discards their cost —
     a meter that only ever goes up would over-report every corrected run. */
  const usage: Usage = run.steps.reduce<Usage>((total, step) => addUsage(total, step.usage ?? {}), ZERO_USAGE);
  const cost = costOf(run.model || model, usage);

  const liveStep = run.status === "running" ? run.steps.at(-1)?.index : undefined;

  return (
    <div className="flex h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Runs */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 p-3 md:flex dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setRunId(null)}
          className="mb-3 flex h-9 items-center justify-center rounded-lg border border-zinc-200 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          New run
        </button>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {runs.length === 0 && (
            <p className="px-2 py-4 text-xs text-zinc-500">Runs you start appear here.</p>
          )}
          {runs.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRunId(r.id)}
              className={`w-full truncate rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                r.id === runId ? "bg-zinc-100 font-medium dark:bg-zinc-900" : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {r.goal}
            </button>
          ))}
        </div>
        <p className="px-2 pt-3 text-[11px] leading-4 text-zinc-400">
          Runs live in server memory and are lost on restart. See lib/run-store.ts.
        </p>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {runId === null ? (
          <NewRun goal={goal} setGoal={setGoal} model={model} setModel={setModel} starting={starting} onSubmit={start} />
        ) : (
          <>
            <header className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
              <div className="mx-auto max-w-3xl space-y-3">
                <AgentStatus
                  name={run.goal || "Run"}
                  status={
                    run.status === "running"
                      ? "running"
                      : run.status === "awaiting-approval"
                        ? "waiting"
                        : run.status === "completed"
                          ? "completed"
                          : "failed"
                  }
                  action={
                    run.status === "awaiting-approval"
                      ? `Paused — ${run.pending.length} approval${run.pending.length === 1 ? "" : "s"} waiting`
                      : run.status === "cancelled"
                        ? "Cancelled"
                        : `${modelName(run.model || model)} · step ${run.steps.length}`
                  }
                  elapsed={run.startedAt ? elapsed(run.startedAt) : undefined}
                  onStop={busy ? () => void run.actions.cancel() : undefined}
                  onRetry={
                    run.status === "failed" || run.status === "cancelled" ? () => void run.actions.retry() : undefined
                  }
                />

                {/* Spend, per run. Approximate is marked as approximate — see
                    lib/cost.ts for why a confidently wrong figure is the one
                    thing worse than a hedged one. */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="font-mono tabular-nums">{formatTokens(totalTokens(usage))} tokens</span>
                  {usage.cachedInputTokens !== undefined && usage.cachedInputTokens > 0 && (
                    <span className="font-mono tabular-nums">
                      {formatTokens(usage.cachedInputTokens)} cached
                    </span>
                  )}
                  {usage.reasoningTokens !== undefined && usage.reasoningTokens > 0 && (
                    <span className="font-mono tabular-nums">
                      {formatTokens(usage.reasoningTokens)} reasoning
                    </span>
                  )}
                  <span className="font-mono tabular-nums">{formatCost(cost)}</span>
                  {!run.connected && <span className="text-amber-600 dark:text-amber-500">Reconnecting…</span>}
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-4 py-6">
                {run.steps.length === 0 && (
                  <p className="py-12 text-center text-sm text-zinc-500">Waiting for the first step…</p>
                )}

                {/* The rail is one element behind the whole list, so it does
                    not gap between cards. */}
                <ol className="relative space-y-2">
                  {run.steps.length > 0 && (
                    <span className="absolute bottom-4 left-[13px] top-4 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden />
                  )}
                  {run.steps.map((step) => (
                    <StepCard
                      key={step.index}
                      step={step}
                      model={run.model || model}
                      live={step.index === liveStep}
                      awaitingApproval={step.toolCalls.some((c) => c.state === "awaiting-approval")}
                      failed={run.status === "failed" && step.index === run.steps.length - 1}
                      busyApproval={busyApproval}
                      onApprove={approve}
                      onRerun={(index) => void run.actions.rerunStep(index)}
                    />
                  ))}
                </ol>

                {run.error && (
                  <div className="mt-4">
                    <ErrorMessage
                      message={run.error}
                      severity={/rate limit/i.test(run.error) ? "rate-limit" : "error"}
                      onRetry={() => void run.actions.retry()}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* New run                                                             */
/* ------------------------------------------------------------------ */

function NewRun({
  goal,
  setGoal,
  model,
  setModel,
  starting,
  onSubmit,
}: {
  goal: string;
  setGoal: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  starting: boolean;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">What should the agent do?</h1>
        <p className="mt-2 text-sm text-zinc-500">
          It works in steps you can watch, interrupt, and re-run. Anything other people would see —
          posting a comment, deploying — stops and asks first.
        </p>

        <textarea
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          onKeyDown={(event) => {
            /* Enter submits, Shift+Enter breaks the line. A goal is usually
               one sentence, and reaching for a button to send one sentence
               is the kind of friction that makes a tool feel slow. */
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit(event);
            }
          }}
          rows={3}
          placeholder="Find the open issues about streaming and comment on the most urgent one."
          className="mt-5 w-full resize-none rounded-xl border border-zinc-200 bg-white p-3.5 text-[15px] leading-6 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
        />

        <div className="mt-3 flex items-center gap-2">
          <select
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-2.5 text-[13px] outline-none dark:border-zinc-800 dark:bg-zinc-900"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.hint}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!goal.trim() || starting}
            className="ml-auto inline-flex h-9 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {starting ? "Starting…" : "Start run"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Elapsed                                                             */
/* ------------------------------------------------------------------ */

function elapsed(from: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - from) / 1000));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
