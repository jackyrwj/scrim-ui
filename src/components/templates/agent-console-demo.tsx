"use client";

import * as React from "react";
import { AgentStatus } from "@/showcase/agent-status/agent-status";
import { ApprovalRequest } from "@/showcase/approval-request/approval-request";
import { ToolCall } from "@/showcase/tool-call/tool-call";
import { useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The Agent Run Console, playing one run — and pausing for you.
 *
 * The other template demos on this site are replays. This one is not, at the
 * only moment that matters: when the run reaches the `postComment` step it
 * stops and waits for a click, because that is the template's whole claim.
 * A scripted approval that resolves itself after two seconds would be a
 * demonstration of the opposite feature.
 *
 * The second claim is harder to show and worth more: the run is not in this
 * component. In the template it lives in a server-side append-only event log
 * and the UI is a projection of it, which is why an approval can arrive an
 * hour later in a different tab. "Reload the page" in the window chrome is
 * that, honestly staged — the frame goes blank, the projection is rebuilt
 * from the log, and the run is exactly where it was. Nothing here talks to a
 * server, so the log is an array; the point is the shape, not the transport.
 *
 * No model, no key, no route. Stated under the frame rather than left for
 * someone to discover.
 */

/* Mirrors templates/agent-console/lib/models.ts — USD per 1M tokens. A copy,
   deliberately: the template is a standalone app with its own tsconfig, and
   reaching into it from the site would couple the two builds to save six
   lines. */
const PRICE = { input: 3, cachedInput: 0.3, output: 15 };
const MODEL_NAME = "Claude Sonnet 5";

type Usage = { input: number; cached: number; output: number };

function costOf(usage: Usage): number {
  const fresh = usage.input - usage.cached;
  return (
    (fresh * PRICE.input + usage.cached * PRICE.cachedInput + usage.output * PRICE.output) / 1_000_000
  );
}

function formatCost(usd: number): string {
  return usd < 0.01 ? `$${usd.toFixed(4)}` : `$${usd.toFixed(2)}`;
}

function formatTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/* ------------------------------------------------------------------ */
/* The script                                                          */
/* ------------------------------------------------------------------ */

type ScriptedTool = {
  name: string;
  input: string;
  output: string;
  duration: string;
};

type ScriptedStep = {
  text: string;
  tool?: ScriptedTool;
  /** Set on the step that stops the run until someone decides. */
  approval?: { tool: string; input: string };
  usage: Usage;
  ms: number;
};

const PROMPT = "Triage the login redirect bug and comment on the issue with what you find.";

const STEPS: ScriptedStep[] = [
  {
    text: "Starting with the open issues so I know what people are actually hitting.",
    tool: {
      name: "searchIssues",
      input: `{\n  "query": "login redirect",\n  "state": "open"\n}`,
      output: `[\n  { "number": 412, "title": "Redirect loop after SSO login" },\n  { "number": 398, "title": "?next= param dropped on sign-in" }\n]`,
      duration: "0.6s",
    },
    usage: { input: 1840, cached: 1024, output: 96 },
    ms: 2600,
  },
  {
    text: "#412 and #398 are the same bug seen from two directions. Reading the route.",
    tool: {
      name: "readFile",
      input: `{\n  "path": "app/login/route.ts"\n}`,
      output: `const next = url.searchParams.get("next");\nreturn Response.redirect(next ?? "/login");`,
      duration: "0.2s",
    },
    usage: { input: 2410, cached: 1840, output: 142 },
    ms: 2800,
  },
  {
    text: "That default sends an unauthenticated user back to /login, which is the loop. I have enough to write it up.",
    approval: {
      tool: "postComment",
      input: `{\n  "issue": 412,\n  "body": "The redirect falls back to /login when ?next= is\\nmissing, so an unauthenticated hit loops. Sending it\\nto / instead fixes both #412 and #398."\n}`,
    },
    usage: { input: 3120, cached: 2410, output: 210 },
    ms: 2400,
  },
];

/** The step after the gate, which depends on what you decided. */
const AFTER: Record<"approved" | "denied", ScriptedStep> = {
  approved: {
    text: "Commented on #412 and linked #398 to it. Both are the same one-line default.",
    tool: {
      name: "postComment",
      input: `{\n  "issue": 412\n}`,
      output: `{\n  "url": "github.com/acme/app/issues/412#issuecomment-88",\n  "posted": true\n}`,
      duration: "0.8s",
    },
    usage: { input: 3480, cached: 3120, output: 128 },
    ms: 2600,
  },
  denied: {
    text: "Understood — I have not posted anything. The finding stands: the fallback in app/login/route.ts should be \"/\" rather than \"/login\", which closes #412 and #398 together. The draft is above if you want to paste it yourself.",
    usage: { input: 3510, cached: 3120, output: 164 },
    ms: 2600,
  },
};

/** The script is STEPS plus one branch, so the cursor indexes past the end. */
function stepAt(index: number, decision: "approved" | "denied" | null): ScriptedStep | null {
  if (index < STEPS.length) return STEPS[index];
  if (index === STEPS.length && decision) return AFTER[decision];
  return null;
}

/* ------------------------------------------------------------------ */
/* The machine                                                         */
/* ------------------------------------------------------------------ */

/** How far the run has got. `cursor` counts finished steps. */
type Run = {
  cursor: number;
  /** null until the reader decides; the run does not move without it. */
  decision: "approved" | "denied" | null;
  /** Bumped by "Reload the page" — remounts the projection, not the run. */
  generation: number;
};

const START: Run = { cursor: 0, decision: null, generation: 0 };

export function AgentConsoleDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [run, setRun] = React.useState(START);
  const [reloading, setReloading] = React.useState(false);

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);

  /* Reduced motion gets the frame at the gate — the one screen that carries
     the template's argument, and the only interactive one. Everything below
     reads `cursor`, so there is one code path rather than two. */
  const cursor = reduced && run.decision === null ? STEPS.length - 1 : run.cursor;
  const decision = run.decision;

  /* The gate: the cursor has reached the approval step and nobody has
     answered. Note what is missing — a timeout. */
  const atGate = cursor === STEPS.length - 1 && decision === null;
  /* One step past the last: the answer the decision produced has been read. */
  const finished = cursor > STEPS.length;
  const running = !atGate && !finished && !reloading;

  const playing = inView && !reduced && running;

  /* One timeout per step, cleared on every change, so scrolling away
     mid-run cannot leave a stray timer behind. In the template this is a
     server-side loop and the browser only listens; here the browser is
     pretending to be both, which is the one liberty this file takes. */
  React.useEffect(() => {
    if (!playing) return;
    const step = stepAt(cursor, decision);
    if (!step) return;
    const t = window.setTimeout(() => {
      setRun((r) => ({ ...r, cursor: r.cursor + 1 }));
    }, step.ms);
    return () => window.clearTimeout(t);
  }, [playing, cursor, decision]);

  /* The reload. Blank for a beat, then the same run rebuilt from the log —
     which is the difference between state in a component and state in an
     event log, shown rather than asserted. */
  React.useEffect(() => {
    if (!reloading) return;
    const t = window.setTimeout(() => setReloading(false), 620);
    return () => window.clearTimeout(t);
  }, [reloading]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [cursor, decision, reloading]);

  function decide(approved: boolean) {
    /* The cursor is set outright rather than incremented: under reduced
       motion the run never walked here, it was rendered here. */
    setRun((r) => ({ ...r, decision: approved ? "approved" : "denied", cursor: STEPS.length }));
  }

  function replay() {
    setRun((r) => ({ ...START, generation: r.generation + 1 }));
  }

  function reload() {
    setReloading(true);
    setRun((r) => ({ ...r, generation: r.generation + 1 }));
  }

  /* The steps behind the cursor are finished; the one under it is either
     running or holding the gate up. */
  const done: ScriptedStep[] = [];
  for (let i = 0; i < cursor; i++) {
    const step = stepAt(i, decision);
    if (step) done.push(step);
  }

  const current = stepAt(cursor, decision);

  /* Totals, summed from finished steps only — never from the one in flight.
     A number that is about to change is worse than a gap. */
  const settled = done;
  const totals = settled.reduce(
    (acc, s) => ({
      tokens: acc.tokens + s.usage.input + s.usage.output,
      usd: acc.usd + costOf(s.usage),
    }),
    { tokens: 0, usd: 0 },
  );

  const elapsed = `${(settled.reduce((ms, s) => ms + s.ms, 0) / 1000).toFixed(1)}s`;

  const agentState = finished ? "completed" : atGate ? "waiting" : "running";

  return (
    <div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border border-(--border)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-3 border-b border-(--border) bg-(--muted) px-3 py-2">
          <div className="flex gap-1.5" aria-hidden>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full opacity-60" style={{ background: c }} />
            ))}
          </div>
          <span className="hidden truncate text-[11px] text-(--muted-foreground) sm:inline">
            localhost:3000/runs/r_8f21
          </span>

          <span className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--border) bg-(--card) px-2 py-0.5 font-mono text-[10px] text-(--muted-foreground)">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: atGate ? "#f59e0b" : finished ? "#22c55e" : "var(--primary)" }}
              aria-hidden
            />
            {reloading ? "replaying log" : `status: ${agentState}`}
          </span>

          {/* The demonstration, not a control: the run is not in this
              component, so throwing the component away cannot lose it. */}
          <button
            type="button"
            onClick={reload}
            className="shrink-0 rounded-md border border-(--border) bg-(--card) px-2 py-0.5 text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={replay}
            className="shrink-0 rounded-md border border-(--border) bg-(--card) px-2 py-0.5 text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Replay
          </button>
        </div>

        {/* The app, in the app's own palette rather than the site's — a
            preview that adopts the surrounding theme tokens shows you this
            page, not the thing you are buying. */}
        <div className="flex h-[28rem] bg-white text-zinc-900 sm:h-[32rem] dark:bg-zinc-950 dark:text-zinc-100">
          <aside className="hidden w-52 shrink-0 flex-col border-r border-zinc-200 p-2.5 sm:flex dark:border-zinc-800">
            <div className="mb-2.5 flex h-8 items-center justify-center rounded-lg border border-zinc-200 text-xs font-medium dark:border-zinc-800">
              New run
            </div>
            <div className="space-y-0.5">
              {[
                { id: "r_8f21", label: "Triage login redirect", live: true },
                { id: "r_8f10", label: "Backfill changelog", live: false },
                { id: "r_8e94", label: "Bump deps to 16.3", live: false },
              ].map((r, i) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-[12px] ${
                    i === 0 ? "bg-zinc-100 font-medium dark:bg-zinc-900" : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      r.live
                        ? atGate
                          ? "bg-amber-500"
                          : finished
                            ? "bg-emerald-500"
                            : "animate-pulse bg-blue-500"
                        : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                    aria-hidden
                  />
                  <span className="truncate">{r.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-auto px-2 text-[10px] leading-4 text-zinc-400">
              Runs live on the server. Closing the tab does not stop one.
            </p>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-zinc-200 px-3.5 py-3 dark:border-zinc-800">
              <AgentStatus
                name="triage-agent"
                status={agentState}
                action={
                  atGate
                    ? "Waiting on your approval to comment on #412"
                    : finished
                      ? "Finished"
                      : `Step ${Math.min(cursor + 1, STEPS.length)} of up to 40`
                }
                elapsed={elapsed}
                onStop={running ? replay : undefined}
              />
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                <span>{MODEL_NAME}</span>
                <span>{settled.length} steps</span>
                <span>{formatTokens(totals.tokens)} tokens</span>
                <span>{formatCost(totals.usd)}</span>
              </div>
            </div>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3.5 py-4">
              {reloading ? (
                <ReplaySkeleton />
              ) : (
                <>
                  <p className="mb-4 rounded-xl bg-zinc-100 px-3 py-2 text-[13px] leading-6 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    {PROMPT}
                  </p>

                  <ol key={run.generation} className="relative space-y-2.5">
                    {/* One rail for the whole list, so it cannot break
                        between items. */}
                    <span
                      className="absolute bottom-3 left-[13px] top-3 w-px bg-zinc-200 dark:bg-zinc-800"
                      aria-hidden
                    />

                    {done.map((step, i) => (
                      <StepRow key={i} index={i} step={step} state="done" open={false} />
                    ))}

                    {/* The step under the cursor: generating, or stopped
                        dead waiting for a person. */}
                    {current && (
                      <StepRow
                        index={done.length}
                        step={current}
                        state={atGate ? "waiting" : "live"}
                        open
                        gate={
                          atGate && current.approval ? (
                            <ApprovalRequest
                              title={`Run ${current.approval.tool}`}
                              requester="The agent"
                              description="This step is paused until you decide. The run resumes on its own afterwards — you can close this tab in the meantime."
                              detail={current.approval.input}
                              status="pending"
                              onAllow={() => decide(true)}
                              onDeny={() => decide(false)}
                            />
                          ) : undefined
                        }
                      />
                    )}
                  </ol>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
        The approval is real — the run will sit there until you allow or deny it, and it answers
        differently either way. Everything else is scripted: there is no model and no route behind
        this page. In the template the run lives in a server-side event log, which is what{" "}
        <strong className="font-medium text-(--foreground)">Reload</strong> above is standing in for.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One step                                                            */
/* ------------------------------------------------------------------ */

function StepRow({
  index,
  step,
  state,
  open,
  gate,
}: {
  index: number;
  step: ScriptedStep;
  state: "live" | "waiting" | "done";
  open: boolean;
  gate?: React.ReactNode;
}) {
  const usd = costOf(step.usage);
  const tokens = step.usage.input + step.usage.output;
  const settled = state === "done";

  return (
    <li className="relative pl-8">
      <span
        className={`absolute left-[9px] top-3.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-950 ${
          state === "waiting"
            ? "bg-amber-500"
            : state === "live"
              ? "animate-pulse bg-blue-500"
              : "bg-zinc-300 dark:bg-zinc-700"
        }`}
        aria-hidden
      />

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-700 dark:text-zinc-300">
            {step.tool?.name ?? step.approval?.tool ?? "Thinking"}
          </span>
          {/* Nothing until the numbers exist. "$0.0000" for a step still in
              flight is a number that is about to be wrong. */}
          {settled && (
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {formatTokens(tokens)} · {formatCost(usd)} · {(step.ms / 1000).toFixed(1)}s
            </span>
          )}
        </div>

        {open && (
          <div className="space-y-3 border-t border-zinc-100 px-3.5 py-3 dark:border-zinc-800">
            <p className="whitespace-pre-wrap text-[13px] leading-6 text-zinc-700 dark:text-zinc-300">
              {step.text}
              {state === "live" && (
                <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
              )}
            </p>

            {step.tool && (
              <ToolCall
                name={step.tool.name}
                status={state === "live" ? "running" : "success"}
                input={step.tool.input}
                output={state === "live" ? undefined : step.tool.output}
                duration={state === "live" ? undefined : step.tool.duration}
              />
            )}

            {gate}
          </div>
        )}
      </div>
    </li>
  );
}

/** What a rebuild from the log looks like: a beat of nothing, then the run
 *  exactly where it was. */
function ReplaySkeleton() {
  return (
    <div className="animate-pulse space-y-2.5 pt-1" aria-hidden>
      <div className="h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="ml-8 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      ))}
    </div>
  );
}
