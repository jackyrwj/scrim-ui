"use client";

import * as React from "react";

/**
 * The pause that asks "should I actually do this?" — as a lifecycle rather
 * than a card.
 *
 * The card is the easy half. Two buttons, an allow and a deny, and if the
 * agent run lived inside this component that would be the whole job. It does
 * not. An approval is a **blocking decision inside a streaming transport**,
 * and every hard part of this component comes from that one sentence:
 *
 *  - **The tab closes mid-approval.** If the pending state lives in React,
 *    the decision dies with the tab and the run waits forever for an answer
 *    nobody can give any more.
 *  - **The same run is open in two tabs.** Both show the gate. Both can be
 *    clicked. If each tab renders its own optimistic result, one of them is
 *    lying — and if the second click reaches the server, an "approve" and a
 *    "deny" race for the same action.
 *  - **The decision lands after the request expired.** The click was real and
 *    the answer is honest, and the run stopped waiting four minutes ago. The
 *    worst thing to render here is a green tick.
 *
 * So: **this component owns no decision.** `outcome` is a projection of what
 * the run says happened — read from the event log, replayed on reconnect,
 * identical in every tab. `submitting` is the only local state, and it means
 * one thing: a request is in flight from *this* tab. It is deliberately not
 * an optimistic outcome, because the server is allowed to disagree with it,
 * and the two states it disagrees with are the two above.
 *
 * `request.id` is the idempotency key, not a React key. Send it with the
 * decision. Two tabs, a double click and a retried fetch then collapse into
 * one decision on the server, which is the only place they can be collapsed.
 */

export type ApprovalDecision = "approved" | "denied";

export type ApprovalRequest = {
  /** Idempotency key. Send it with the decision; the server dedupes on it. */
  id: string;
  title: string;
  requester?: string;
  description?: string;
  /** The exact thing that will happen. A shell command, a diff, a payload. */
  detail?: string;
  /** Epoch ms after which the run stops waiting. Omit for no deadline. */
  expiresAt?: number;
};

export type ApprovalOutcome = {
  decision: ApprovalDecision;
  /** Who decided, if it was not the person looking at this. */
  decidedBy?: string;
  /** Epoch ms. */
  at?: number;
  /**
   * The server accepted the decision but the run had already stopped waiting.
   * The answer was recorded; the action did not happen. Rendering this as an
   * ordinary approval is the single most misleading thing this component
   * could do.
   */
  stale?: boolean;
};

export type ApprovalGateProps = {
  request: ApprovalRequest;
  /**
   * What the RUN says happened. Undefined means still pending. Comes from the
   * event stream, never from a click handler in this component.
   */
  outcome?: ApprovalOutcome;
  /**
   * A decision in flight from this tab. Set it when the request goes out,
   * clear it when the outcome arrives over the stream — not when the fetch
   * resolves, because the fetch resolving is not the run agreeing.
   */
  submitting?: ApprovalDecision;
  /**
   * The event stream's health. While `reconnecting`, a pending gate might
   * already have been decided somewhere else and this tab has not heard yet,
   * so the buttons say so instead of pretending to be authoritative.
   */
  connection?: "live" | "reconnecting" | "offline";
  /** Must send `request.id`. Fire and forget — the outcome arrives on the stream. */
  onDecide?: (decision: ApprovalDecision, requestId: string) => void;
  /** Injectable clock, so the countdown is testable and the demos are stable. */
  now?: number;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12" className="animate-spin" {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Time                                                                */
/* ------------------------------------------------------------------ */

function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 === 0 ? `${m}m` : `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/**
 * A clock that only runs when something on screen depends on it.
 *
 * `now` from the host wins — the run already has a clock, and two clocks
 * disagreeing by a second is how a countdown reads 0s next to an active
 * button. Falls back to a local tick, started only while a deadline is
 * pending, so a settled gate is not re-rendering once a second forever.
 */
function useNow(provided: number | undefined, active: boolean): number {
  const [tick, setTick] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (provided !== undefined || !active) return;
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [provided, active]);
  return provided ?? tick;
}

/* ------------------------------------------------------------------ */
/* ApprovalGate                                                        */
/* ------------------------------------------------------------------ */

export function ApprovalGate({
  request,
  outcome,
  submitting,
  connection = "live",
  onDecide,
  now: providedNow,
  className = "",
}: ApprovalGateProps) {
  const pending = outcome === undefined;
  const now = useNow(providedNow, pending && request.expiresAt !== undefined);

  const remaining = request.expiresAt === undefined ? undefined : request.expiresAt - now;
  const expired = pending && remaining !== undefined && remaining <= 0;
  /* Urgency is a colour change, not a countdown that turns red at the end and
     surprises someone who looked away. Thirty seconds is roughly the point a
     reader can still act. */
  const urgent = remaining !== undefined && remaining > 0 && remaining < 30_000;

  const actionable = pending && !expired && submitting === undefined;
  const tone = outcome
    ? outcome.stale
      ? "amber"
      : outcome.decision === "approved"
        ? "emerald"
        : "red"
    : expired
      ? "zinc"
      : "amber";

  return (
    <div
      className={`rounded-xl border bg-white p-4 dark:bg-zinc-900 ${
        expired
          ? "border-zinc-200 dark:border-zinc-800"
          : outcome
            ? "border-zinc-200 dark:border-zinc-800"
            : "border-amber-200 dark:border-amber-900/60"
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            tone === "emerald"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : tone === "red"
                ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                : tone === "zinc"
                  ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
          }`}
        >
          {expired ? <ClockIcon width="16" height="16" /> : <ShieldIcon />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{request.title}</p>
            {pending && remaining !== undefined && !expired && (
              <span
                /* aria-live off: a countdown announced every second is a
                   screen reader nobody can use. The deadline is in the
                   button's own label instead. */
                aria-hidden
                className={`shrink-0 tabular-nums text-[11px] ${
                  urgent ? "text-amber-600 dark:text-amber-500" : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {formatDuration(remaining)} left
              </span>
            )}
          </div>

          {request.requester && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {request.requester} is requesting approval
            </p>
          )}
          {request.description && (
            <p className="mt-1.5 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
              {request.description}
            </p>
          )}
          {request.detail && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-50 p-2.5 font-mono text-xs leading-5 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
              {request.detail}
            </pre>
          )}

          {/* ---------------- pending ---------------- */}
          {pending && !expired && (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDecide?.("approved", request.id)}
                  disabled={!actionable}
                  /* emerald-700, not -600: white on emerald-600 is 3.65:1,
                     under the 4.5 floor for this 12px label. -700 is 5.48:1. */
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting === "approved" ? <Spinner /> : <CheckIcon />}
                  Allow
                </button>
                <button
                  type="button"
                  onClick={() => onDecide?.("denied", request.id)}
                  disabled={!actionable}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-3.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {submitting === "denied" ? <Spinner /> : <XIcon />}
                  Deny
                </button>
              </div>

              {/* The buttons stay visible and go inert rather than being
                  replaced. A card that empties itself the instant you click
                  reads as "did that work?" — and the answer is still in
                  flight, so the honest thing is to say so. */}
              {submitting !== undefined && (
                <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Sent. Waiting for the run to confirm — this is not decided until it does.
                </p>
              )}

              {submitting === undefined && connection !== "live" && (
                <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-500">
                  {connection === "reconnecting"
                    ? "Reconnecting — this may already have been decided elsewhere."
                    : "Offline — a decision cannot be sent until the run is reachable again."}
                </p>
              )}
            </>
          )}

          {/* ---------------- expired ---------------- */}
          {expired && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <ClockIcon />
              Expired {formatDuration(-remaining!)} ago — the run stopped waiting and did not act.
            </p>
          )}

          {/* ---------------- settled ---------------- */}
          {outcome && (
            <div className="mt-3">
              <p
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  outcome.stale
                    ? "text-amber-600 dark:text-amber-500"
                    : outcome.decision === "approved"
                      ? /* -700 in light: emerald-600 on white is 3.65:1 at 12px. */
                        "text-emerald-700 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {outcome.stale ? <ClockIcon /> : outcome.decision === "approved" ? <CheckIcon /> : <XIcon />}
                {outcome.stale
                  ? `Recorded as ${outcome.decision}, but too late — the run had already stopped waiting, and the action did not run.`
                  : outcome.decision === "approved"
                    ? "Approved — action executed"
                    : "Denied — action blocked"}
              </p>
              {outcome.decidedBy && (
                /* Named, because on a shared run "who clicked allow" is the
                   first question asked afterwards, and the second tab that
                   was watching deserves to know it was not ignored. */
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  by {outcome.decidedBy}
                  {outcome.at !== undefined && ` · ${formatDuration(now - outcome.at)} ago`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
