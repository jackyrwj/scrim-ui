"use client";

import type { ComponentControls, ControlValues } from "@/lib/component-controls";
import type { RunEvent, RunEventKind, RunEventStatus } from "./agent-run-timeline";
import { AgentRunTimeline } from "./agent-run-timeline";

/** The reader edits the log as text, one event per line:
 *  `[mark] kind title | time | detail | durationMs`
 *  Marks: `*` running, `~` waiting, `!` failed, `x` cancelled,
 *  `>` retry of the last failed event. No mark = completed. */
const SAMPLE = [
  "model Planner drafted 6-step plan | 14:02:03 | | 3200",
  "tool search_docs(\"refund policy\") | 14:02:05 | 4 passages | 1800",
  "tool read_file(\"orders/1042.json\") | 14:02:07 | | 640",
  "model Drafted refund summary | 14:02:10 | | 2100",
  "! tool update_order(1042, refund=true) | 14:02:24 | API timeout after 5s | 5000",
  "> tool update_order(1042, refund=true) | 14:02:31 | Succeeded on retry | 1100",
  "handoff Handoff to Billing agent | 14:02:33 | Context: refund approved",
  "~ approval Issue $48.20 refund to card •• 4242 | 14:02:35 | Irreversible — charges the account",
].join("\n");

const KINDS: RunEventKind[] = ["model", "tool", "approval", "handoff", "error", "note"];

function parse(text: string): RunEvent[] {
  const events: RunEvent[] = [];
  let lastFailedId: string | undefined;
  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    const mark = line[0];
    const body = ["*", "~", "!", "x", ">"].includes(mark) ? line.slice(1).trim() : line;
    const [head, at, detail, dur] = body.split("|").map((s) => s.trim());
    const sp = head.indexOf(" ");
    const kind = (sp === -1 ? head : head.slice(0, sp)).toLowerCase() as RunEventKind;
    const title = sp === -1 ? "" : head.slice(sp + 1).trim();
    if (!title || !KINDS.includes(kind)) return;
    const status: RunEventStatus =
      mark === "*" ? "running" : mark === "~" ? "waiting" : mark === "!" ? "failed" : mark === "x" ? "cancelled" : "completed";
    const id = `e${events.length + 1}`;
    events.push({
      id,
      kind,
      title,
      at: at || "—",
      detail: detail || undefined,
      status,
      durationMs: dur && !Number.isNaN(Number(dur)) ? Number(dur) : undefined,
      retryOf: mark === ">" ? lastFailedId : undefined,
    });
    if (mark === "!") lastFailedId = id;
  });
  return events;
}

function serialize(events: RunEvent[]) {
  const rows = events
    .map(
      (e) =>
        `  { id: ${JSON.stringify(e.id)}, kind: ${JSON.stringify(e.kind)}, title: ${JSON.stringify(e.title)}` +
        `, at: ${JSON.stringify(e.at)}, status: ${JSON.stringify(e.status)}` +
        `${e.detail ? `, detail: ${JSON.stringify(e.detail)}` : ""}` +
        `${e.durationMs != null ? `, durationMs: ${e.durationMs}` : ""}` +
        `${e.retryOf ? `, retryOf: ${JSON.stringify(e.retryOf)}` : ""} },`,
    )
    .join("\n");
  return `const EVENTS = [\n${rows}\n];`;
}

export const agentRunTimelineControls: ComponentControls = {
  tag: "AgentRunTimeline",
  importFrom: "./agent-run-timeline",
  controls: [
    { kind: "text", name: "events", label: "Events (* running, ~ waiting, ! failed, x cancelled, > retry)", value: SAMPLE, multiline: true },
    { kind: "text", name: "elapsed", label: "Summary elapsed", value: "38s" },
    { kind: "number", name: "tokens", label: "Summary tokens", value: 18420, min: 0, max: 1000000, step: 100 },
    { kind: "text", name: "cost", label: "Summary cost", value: "$0.11" },
    { kind: "text", name: "emptyText", label: "Empty text", value: "No events yet — the run's activity will appear here.", multiline: true },
  ],
  handlers: ["onApprove", "onReject"],
  remountOn: ["events"],
  derive: (v): { preamble?: string; props?: Record<string, string> } => {
    const events = parse(String(v.events));
    if (events.length === 0) return { props: { events: "[]" } };
    const elapsed = String(v.elapsed);
    const tokens = Number(v.tokens);
    const cost = String(v.cost);
    return {
      preamble: serialize(events),
      props: {
        events: "EVENTS",
        summary: `{ ${[elapsed && `elapsed: ${JSON.stringify(elapsed)}`, tokens > 0 && `tokens: ${tokens}`, cost && `cost: ${JSON.stringify(cost)}`].filter(Boolean).join(", ")} }`,
      },
    };
  },
  presets: [
    {
      id: "running",
      title: "Running",
      note: "One active step, the rest folded — the reader sees the pulse, not the noise.",
      values: {
        events: [
          "model Planner drafted 6-step plan | 14:02:03 | | 3200",
          "tool search_docs(\"refund policy\") | 14:02:05 | 4 passages | 1800",
          "tool read_file(\"orders/1042.json\") | 14:02:07 | | 640",
          "* tool generate_report() | 14:02:12 | Streaming sections",
        ].join("\n"),
      },
    },
    {
      id: "waiting",
      title: "Waiting on approval",
      note: "The irreversible step keeps its rank — amber edge, Approve/Reject on the row.",
      values: {},
    },
    {
      id: "failed",
      title: "Failed",
      note: "The original failure stays in the log; the retry is a new linked event.",
      values: {
        events: [
          "model Planner drafted 6-step plan | 14:02:03 | | 3200",
          "! tool update_order(1042, refund=true) | 14:02:24 | API timeout after 5s | 5000",
          "x model Aborted remaining steps | 14:02:25",
        ].join("\n"),
      },
    },
    {
      id: "completed",
      title: "Completed",
      note: "A finished run folds all success into countable clusters.",
      values: {
        events: [
          "model Planner drafted 6-step plan | 14:02:03 | | 3200",
          "tool search_docs(\"refund policy\") | 14:02:05 | 4 passages | 1800",
          "tool read_file(\"orders/1042.json\") | 14:02:07 | | 640",
          "model Drafted refund summary | 14:02:10 | | 2100",
          "handoff Handoff to Billing agent | 14:02:33 | Context: refund approved",
        ].join("\n"),
      },
    },
    {
      id: "long-run",
      title: "Long run",
      note: "80 steps in — success collapses, the one failure and the approval stand out.",
      values: {
        events: [
          ...Array.from({ length: 12 }, (_, i) => `tool batch_lookup(${i + 1}) | 14:0${2 + Math.floor(i / 6)}:${String(3 + i * 4).padStart(2, "0")} | | ${400 + i * 90}`),
          "! tool batch_lookup(13) | 14:04:51 | Rate limited | 900",
          "> tool batch_lookup(13) | 14:05:10 | Succeeded on retry | 1300",
          ...Array.from({ length: 8 }, (_, i) => `tool batch_lookup(${i + 14}) | 14:05:${String(14 + i * 4).padStart(2, "0")} | | ${500 + i * 70}`),
          "~ approval Write 21 rows to production DB | 14:05:58 | Irreversible",
        ].join("\n"),
      },
    },
  ],
};

export function renderAgentRunTimeline(v: ControlValues, key: string) {
  const events = parse(String(v.events));
  const tokens = Number(v.tokens);
  return (
    <div key={key} className="flex h-[440px] flex-col p-4">
      <AgentRunTimeline
        className="flex-1"
        events={events}
        onApprove={() => {}}
        onReject={() => {}}
        emptyText={String(v.emptyText)}
        summary={{
          elapsed: String(v.elapsed) || undefined,
          tokens: tokens > 0 ? tokens : undefined,
          cost: String(v.cost) || undefined,
        }}
      />
    </div>
  );
}
