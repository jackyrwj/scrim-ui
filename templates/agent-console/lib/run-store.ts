import type { ModelMessage } from "ai";
import type { RunEvent, RunStatus, SequencedEvent } from "./events";

/**
 * Where a run lives.
 *
 * Say the quiet part first: **this is a Map on the server module scope.** It
 * does not survive a restart, it is not shared between serverless instances,
 * and on a platform that scales past one region a run started on one instance
 * is invisible to the approval POST that lands on the next. Deployed as-is,
 * the honest description is "works until it does not".
 *
 * It is here anyway, and deliberately, because a template that opened with
 * "first, provision Postgres" is a template nobody runs. The part worth
 * paying for is the *shape* — an append-only event log, a message array that
 * can be truncated to a step boundary, and an AbortController that is not
 * the same thing as a status — and none of that cares where the bytes live.
 * So the storage is the smallest thing that makes the rest real, and it is
 * quarantined behind the functions below.
 *
 * **Swapping it for a real store** touches this file and nothing else:
 *
 *   - `createRun` / `getRun`  → INSERT / SELECT on a `runs` table.
 *   - `appendEvent`           → INSERT into `run_events (run_id, seq, json)`,
 *                               with a unique index on (run_id, seq). That
 *                               index is what makes concurrent writers safe.
 *   - `subscribe`             → LISTEN/NOTIFY, Redis pub/sub, or polling on
 *                               seq. The replay-then-subscribe order below is
 *                               the part to keep: subscribe first, then read
 *                               the backlog, or you drop whatever arrives in
 *                               between.
 *   - `controllers`           → stays in memory. An AbortController cannot be
 *                               serialised, so in a multi-instance deployment
 *                               cancellation has to travel as a message to
 *                               the instance holding the stream. Persisting
 *                               `status: 'cancelled'` is not cancellation —
 *                               the model keeps generating and you keep
 *                               paying for it.
 */

if (typeof window !== "undefined") {
  throw new Error("lib/run-store.ts was imported into client code.");
}

export type Run = {
  id: string;
  goal: string;
  model: string;
  status: RunStatus;
  createdAt: number;
  updatedAt: number;
  error?: string;
  /**
   * The conversation as the model sees it. This — not the event log — is what
   * gets sent back on resume. The log is for the human; this is for the model.
   */
  messages: ModelMessage[];
  /** Append-only. Index in this array + 1 is the event's `seq`. */
  events: RunEvent[];
  /**
   * `messages.length` at the start of each step, so a re-run can truncate the
   * conversation to exactly where that step began. Without it, "re-run step
   * 3" can only mean "start over", which is the version everyone ships.
   */
  boundaries: number[];
  /** Approval ids the SDK is waiting on, with the step they were raised in. */
  pending: Map<string, { step: number; toolCallId: string }>;
  step: number;
};

type Listener = (event: SequencedEvent) => void;

const runs = new Map<string, Run>();
const listeners = new Map<string, Set<Listener>>();
/** Not on the Run: an AbortController does not serialise. See the note above. */
const controllers = new Map<string, AbortController>();

export function newRunId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `r_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function createRun(input: { goal: string; model: string }): Run {
  const run: Run = {
    id: newRunId(),
    goal: input.goal,
    model: input.model,
    status: "running",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [{ role: "user", content: input.goal }],
    events: [],
    boundaries: [],
    pending: new Map(),
    step: 0,
  };
  runs.set(run.id, run);
  appendEvent(run.id, { type: "run-started", goal: run.goal, model: run.model, at: run.createdAt });
  return run;
}

export function getRun(id: string): Run | undefined {
  return runs.get(id);
}

export function listRuns(): { id: string; goal: string; status: RunStatus; createdAt: number }[] {
  return [...runs.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(({ id, goal, status, createdAt }) => ({ id, goal, status, createdAt }));
}

/* ------------------------------------------------------------------ */
/* The log                                                             */
/* ------------------------------------------------------------------ */

export function appendEvent(runId: string, event: RunEvent): void {
  const run = runs.get(runId);
  if (!run) return;
  run.events.push(event);
  run.updatedAt = Date.now();
  const sequenced: SequencedEvent = { seq: run.events.length, event };
  for (const listener of listeners.get(runId) ?? []) {
    /* One slow reader must not stall the run — the log already has the event,
       so a listener that throws has only lost its own connection. */
    try {
      listener(sequenced);
    } catch {
      /* dropped; the reader will replay from its last seq on reconnect */
    }
  }
}

export function setStatus(runId: string, status: RunStatus, error?: string): void {
  const run = runs.get(runId);
  if (!run) return;
  run.status = status;
  run.error = error;
  appendEvent(runId, { type: "status", status, error });
}

/**
 * Events after `fromSeq`, then everything that arrives next.
 *
 * The order inside this function is the whole point. The listener is
 * registered *before* the backlog is read, so an event appended while the
 * backlog is being written is queued rather than lost — and the seq filter
 * then drops the duplicate. Reading first and subscribing second leaves a gap
 * exactly as wide as your slowest write, which is the kind of bug that only
 * shows up under load.
 */
export function subscribe(runId: string, fromSeq: number, listener: Listener): () => void {
  const run = runs.get(runId);
  if (!run) return () => {};

  let highWater = fromSeq;
  const guarded: Listener = (sequenced) => {
    if (sequenced.seq <= highWater) return;
    highWater = sequenced.seq;
    listener(sequenced);
  };

  const set = listeners.get(runId) ?? new Set<Listener>();
  set.add(guarded);
  listeners.set(runId, set);

  const backlog = run.events.slice(fromSeq).map((event, i) => ({ seq: fromSeq + i + 1, event }));
  for (const sequenced of backlog) guarded(sequenced);

  return () => {
    const current = listeners.get(runId);
    current?.delete(guarded);
    if (current && current.size === 0) listeners.delete(runId);
  };
}

/* ------------------------------------------------------------------ */
/* Cancellation                                                        */
/* ------------------------------------------------------------------ */

export function setController(runId: string, controller: AbortController): void {
  controllers.set(runId, controller);
}

export function clearController(runId: string): void {
  controllers.delete(runId);
}

/**
 * Stop the model, not just the output.
 *
 * The lazy version of this flips a status and hides the stream, and the
 * request keeps running on the provider until it finishes — billed in full,
 * with its side effects intact. Aborting the signal is what makes the button
 * mean what it says.
 */
export function cancelRun(runId: string): boolean {
  const run = runs.get(runId);
  if (!run) return false;
  controllers.get(runId)?.abort();
  controllers.delete(runId);
  run.pending.clear();
  setStatus(runId, "cancelled");
  return true;
}

/* ------------------------------------------------------------------ */
/* Re-running a step                                                   */
/* ------------------------------------------------------------------ */

/**
 * Rewind to the start of `step` so it can be run again.
 *
 * Two things happen, and they are different in kind:
 *
 *  - `messages` is **truncated**, because that is the model's input and it
 *    must not contain the attempt being replaced.
 *  - `events` is **appended to**, because that is the client's input and some
 *    client is halfway through replaying it. Renumbering a log under a reader
 *    is how a resumable UI stops being resumable. The `rewind` event tells
 *    the reducer to drop those steps; the history stays intact behind it.
 */
export function rewindTo(runId: string, step: number): boolean {
  const run = runs.get(runId);
  if (!run) return false;
  const boundary = run.boundaries[step];
  if (boundary === undefined) return false;

  controllers.get(runId)?.abort();
  controllers.delete(runId);

  run.messages = run.messages.slice(0, boundary);
  run.boundaries = run.boundaries.slice(0, step);
  run.pending.clear();
  run.step = step;
  run.error = undefined;
  appendEvent(runId, { type: "rewind", step });
  return true;
}
