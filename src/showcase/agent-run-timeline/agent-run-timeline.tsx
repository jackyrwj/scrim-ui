"use client";

import * as React from "react";

/**
 * The long-run activity log for an agent — tens to hundreds of events.
 *
 * The rules this component holds:
 *
 * **Success collapses, trouble expands.** A healthy run is boring; the
 * reader is here for the blocked approval and the failed tool call.
 * Consecutive completed steps fold into a countable cluster — openable,
 * never deleted — while waiting, running, failed and cancelled events are
 * always visible.
 *
 * **A retry never overwrites its original.** The failed attempt stays in
 * the log with its error; the retry lands as a new event linked to it.
 * A log that silently rewrites history is a dashboard, not a record.
 *
 * **The list follows only a reader who's already at the bottom.** New
 * events append without yanking someone reading step 12 of 80 — a "back
 * to latest" pill carries them down when they choose.
 *
 * **Approvals keep their visual rank.** An approval gate is the only event
 * that can spend money or touch production, so it never collapses and it
 * never looks like a tool call.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type RunEventKind = "model" | "tool" | "approval" | "handoff" | "error" | "note";

export type RunEventStatus = "running" | "waiting" | "completed" | "failed" | "cancelled";

export type RunEvent = {
  /** Stable identity — never an array index. */
  id: string;
  kind: RunEventKind;
  title: string;
  detail?: string;
  /** Display timestamp, e.g. "14:02:11". */
  at: string;
  status: RunEventStatus;
  durationMs?: number;
  /** The event this one retries. The original stays in the log, untouched. */
  retryOf?: string;
};

export type RunSummary = {
  tokens?: number;
  cost?: string;
  elapsed?: string;
};

export type AgentRunTimelineProps = {
  events: RunEvent[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  summary?: RunSummary;
  emptyText?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function ModelIcon() {
  return (
    <svg {...ICON_PROPS} width="13" height="13">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg {...ICON_PROPS} width="13" height="13">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ApprovalIcon() {
  return (
    <svg {...ICON_PROPS} width="13" height="13">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HandoffIcon() {
  return (
    <svg {...ICON_PROPS} width="13" height="13">
      <path d="m17 3 4 4-4 4" />
      <path d="M21 7H9" />
      <path d="m7 21-4-4 4-4" />
      <path d="M3 17h12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg {...ICON_PROPS} width="13" height="13">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12.01" x2="12" y1="16" y2="16" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg {...ICON_PROPS} width="13" height="13">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const KIND_ICONS: Record<RunEventKind, React.ReactNode> = {
  model: <ModelIcon />,
  tool: <ToolIcon />,
  approval: <ApprovalIcon />,
  handoff: <HandoffIcon />,
  error: <ErrorIcon />,
  note: <NoteIcon />,
};

/* ------------------------------------------------------------------ */
/* Clustering — consecutive completed steps fold into one row          */
/* ------------------------------------------------------------------ */

type Row = { type: "event"; event: RunEvent } | { type: "cluster"; key: string; events: RunEvent[] };

const COLLAPSIBLE_MIN = 3;

function isCollapsible(e: RunEvent) {
  return e.status === "completed" && e.kind !== "approval";
}

function buildRows(events: RunEvent[]): Row[] {
  const rows: Row[] = [];
  let cluster: RunEvent[] = [];
  const flush = () => {
    if (cluster.length >= COLLAPSIBLE_MIN) {
      rows.push({ type: "cluster", key: `c-${cluster[0].id}`, events: cluster });
    } else {
      cluster.forEach((e) => rows.push({ type: "event", event: e }));
    }
    cluster = [];
  };
  events.forEach((e) => {
    if (isCollapsible(e)) {
      cluster.push(e);
    } else {
      flush();
      rows.push({ type: "event", event: e });
    }
  });
  flush();
  return rows;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/* ------------------------------------------------------------------ */
/* AgentRunTimeline                                                    */
/* ------------------------------------------------------------------ */

export function AgentRunTimeline({
  events,
  onApprove,
  onReject,
  summary,
  emptyText = "No events yet — the run's activity will appear here.",
  className = "",
}: AgentRunTimelineProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const atBottomRef = React.useRef(true);
  const [atBottom, setAtBottom] = React.useState(true);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const rows = buildRows(events);
  const activeId = events.find((e) => e.status === "running" || e.status === "waiting")?.id;

  /* Auto-follow: only while the reader is already at the bottom. The state
     writes happen in the scroll/effect callbacks, never in render. */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [events.length]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const at = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    atBottomRef.current = at;
    setAtBottom(at);
  }

  function jumpToLatest() {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  function toggleCluster(key: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const retryTitles = new Map(events.map((e) => [e.id, e.title]));

  function renderEvent(e: RunEvent) {
    const highlight =
      e.status === "failed" || e.status === "cancelled"
        ? "border-l-2 border-red-400 dark:border-red-500"
        : e.kind === "approval" && e.status === "waiting"
          ? "border-l-2 border-amber-400 dark:border-amber-500"
          : e.status === "running"
            ? "border-l-2 border-blue-400 dark:border-blue-500"
            : "border-l-2 border-transparent";
    return (
      <li key={e.id} data-event-id={e.id} className={`flex flex-wrap items-baseline gap-x-2.5 py-1.5 pl-2 pr-3 ${highlight}`}>
        <span className="w-14 shrink-0 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">{e.at}</span>
        <span className={`shrink-0 self-center ${e.status === "failed" ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"}`}>
          {KIND_ICONS[e.kind]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">{e.title}</span>
          {e.retryOf && (
            <span className="ml-1.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              retry of “{retryTitles.get(e.retryOf) ?? e.retryOf}”
            </span>
          )}
          {e.detail && (
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{e.detail}</span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2 self-center">
          {e.durationMs != null && (
            <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">{formatDuration(e.durationMs)}</span>
          )}
          {e.status === "running" && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" aria-label="Running" />
          )}
          {e.status === "waiting" && e.kind !== "approval" && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Waiting</span>
          )}
          {e.status === "failed" && (
            <span className="text-[11px] font-medium text-red-600 dark:text-red-400">Failed</span>
          )}
          {e.status === "cancelled" && (
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Cancelled</span>
          )}
        </span>
        {e.kind === "approval" && e.status === "waiting" && (onApprove || onReject) && (
          <span className="flex w-full gap-2 pl-[4.75rem] pt-1">
            {onApprove && (
              <button
                type="button"
                onClick={() => onApprove(e.id)}
                className="rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Approve
              </button>
            )}
            {onReject && (
              <button
                type="button"
                onClick={() => onReject(e.id)}
                className="rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Reject
              </button>
            )}
          </span>
        )}
      </li>
    );
  }

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto py-2"
        role="log"
        aria-label="Agent run activity"
      >
        {events.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">{emptyText}</p>
        ) : (
          <ul>
            {rows.map((row) =>
              row.type === "event" ? (
                renderEvent(row.event)
              ) : expanded.has(row.key) ? (
                <React.Fragment key={row.key}>
                  <li className="py-1 pl-2">
                    <button
                      type="button"
                      onClick={() => toggleCluster(row.key)}
                      aria-expanded="true"
                      className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                      Hide {row.events.length} completed steps
                    </button>
                  </li>
                  {row.events.map(renderEvent)}
                </React.Fragment>
              ) : (
                <li key={row.key} className="py-1 pl-2">
                  <button
                    type="button"
                    onClick={() => toggleCluster(row.key)}
                    aria-expanded="false"
                    className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    {row.events.length} completed steps · {row.events[0].at}–{row.events[row.events.length - 1].at}
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      {!atBottom && (
        <button
          type="button"
          onClick={jumpToLatest}
          className="absolute bottom-3 right-3 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          ↓ {activeId ? "Back to active step" : "Back to latest"}
        </button>
      )}

      {summary && (summary.tokens != null || summary.cost || summary.elapsed) && (
        <div className="flex flex-wrap gap-x-4 border-t border-zinc-100 px-3 py-2 text-[11px] tabular-nums text-zinc-500 dark:border-zinc-800/60 dark:text-zinc-400">
          {summary.elapsed && <span>Elapsed {summary.elapsed}</span>}
          {summary.tokens != null && <span>{summary.tokens.toLocaleString()} tokens</span>}
          {summary.cost && <span>{summary.cost}</span>}
        </div>
      )}
    </div>
  );
}
