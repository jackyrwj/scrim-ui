"use client";

import * as React from "react";
import { ApprovalRequest } from "@/showcase/approval-request/approval-request";
import { ErrorMessage } from "@/showcase/error-message/error-message";
import { ThinkingIndicator } from "@/showcase/thinking-indicator/thinking-indicator";
import { CitationList, type Citation } from "@/showcase/citation-ui/citation-ui";
import { sliceTo, useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The Support Copilot template, working one ticket end to end.
 *
 * The template's claim is a division of labour: the copilot reads the ticket,
 * grounds a draft in the knowledge base with citations, and proposes — but a
 * refund moves money, so it stops at an approval card and a human decides.
 * A demo that opened on a finished draft would skip all three beats that make
 * the claim, so the timeline walks them: pick the ticket from the queue, the
 * draft streams in with citation chips resolving against the source list, and
 * then the refund arrives as a gate — amber, with buttons, unmissable. The
 * loop ends where the template ends: the agent's edited reply in the
 * composer, sent by a person or not at all.
 *
 * The gate is scripted — the loop has to come back around unattended, so the
 * pending card resolves itself (approved, the path that shows the full arc).
 * Allow and Deny are wired anyway: Allow skips the wait, Deny settles the
 * card as denied and the inserted reply offers escalation instead of money.
 * A button that does nothing on a page about human sign-off would be a
 * strange thing to ship.
 *
 * One honest blemish, kept on purpose: the draft request is rate-limited once
 * and retries. The error state is part of what the template ships, and a demo
 * in which nothing ever fails teaches nothing about the failure UI.
 *
 * No model, no key, no route. The caption under the frame says so.
 */

/* The ticket, condensed from the template's data/tickets.json (T-1042). The
   queue rail copies ticket-list.tsx's row anatomy: status dot, id, priority,
   subject, customer. */
const TICKETS = [
  { id: "T-1042", subject: "Charged twice for order M-88103", customer: "Priya Raman", status: "open", priority: "high" },
  { id: "T-1043", subject: "Refund request — tent arrived damaged", customer: "Marcus Lee", status: "open", priority: "normal" },
  { id: "T-1044", subject: "Locked out after changing my email", customer: "Sofia Almeida", status: "pending", priority: "normal" },
] as const;

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  normal: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-teal-500",
  pending: "bg-amber-400",
};

const THREAD = [
  { author: "customer", name: "Priya Raman", body: "Hi — my card statement shows two charges of $189.00 from you for order M-88103. I only placed the order once. Can you reverse the second charge?" },
  { author: "agent", name: "Tom", body: "Thanks for flagging this, Priya. I'm checking whether the second $189.00 is a settled charge or a pending authorisation hold — a true duplicate we refund right away." },
  { author: "customer", name: "Priya Raman", body: "Both charges are showing as posted now, not pending. Please refund the duplicate today." },
] as const;

/* The draft as ordered segments — text and citation markers interleaved,
   because that is how the model emits them. The reveal walks the text
   lengths; a chip appears only once the sentence it cites has arrived. */
type DraftSegment = { text: string } | { cite: number };

const DRAFT: DraftSegment[] = [
  { text: "Hi Priya — you're right to flag this. Both $189.00 charges on order M-88103 have posted, and the second is a duplicate on our side.\n\nI've proposed a refund of $189.00 back to your card" },
  { cite: 1 },
  { text: " — it settles in 5–10 business days once approved" },
  { cite: 1 },
  { text: ". You won't need to return anything" },
  { cite: 2 },
  { text: ", and I'm sorry for the runaround." },
];

const CITATIONS: Citation[] = [
  {
    id: 1,
    title: "Refund Policy — settlement times",
    url: "#refund-policy",
    snippet: "Refunds go back to the original payment method and settle within 5–10 business days.",
  },
  {
    id: 2,
    title: "Billing Errors — duplicate charges",
    url: "#billing-errors",
    snippet: "Duplicate posted charges are refunded in full; no return is required.",
  },
];

const REFUND_DETAIL = `{
  "orderId": "M-88103",
  "amount": "$189.00",
  "reason": "Duplicate posted charge"
}`;

/* What lands in the reply composer, one version per decision — the human
   act after the human act. */
const REPLY_APPROVED =
  "Hi Priya — confirmed: the second $189.00 charge on M-88103 was a duplicate, and the refund is done. It settles back to your card in 5–10 business days. Sorry for the runaround.";

const REPLY_DENIED =
  "Hi Priya — confirmed the second $189.00 charge on M-88103 was a duplicate. I can't issue the refund from here, so I've escalated it to our billing lead and you'll hear back today. Sorry for the runaround.";

type Phase =
  | "queue"
  | "selected"
  | "limited"
  | "reading"
  | "drafting"
  | "proposing"
  | "settled"
  | "inserted";

/* The ticket, as a sequence of screens. The gate holds longest — it is the
   screen the template exists to show. */
const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "queue", ms: 1200 },
  { phase: "selected", ms: 1800 },
  { phase: "limited", ms: 1900 },
  { phase: "reading", ms: 1900 },
  { phase: "drafting", ms: 4600 },
  { phase: "proposing", ms: 4200 },
  { phase: "settled", ms: 3000 },
  { phase: "inserted", ms: 5600 },
];

const DRAFT_TOTAL = DRAFT.reduce((n, s) => ("text" in s ? n + s.text.length : n), 0);

/* Cumulative text length before each segment — precomputed once because
   DRAFT is static, so the reveal below is a lookup rather than a walk with
   a running total mutated mid-render. */
const DRAFT_STARTS: number[] = (() => {
  const starts: number[] = [];
  let acc = 0;
  for (const s of DRAFT) {
    starts.push(acc);
    if ("text" in s) acc += s.text.length;
  }
  return starts;
})();

/** The pill in the window chrome: what the workbench would say about the
 *  copilot on each screen. */
function statusFor(phase: Phase, decision: "approved" | "denied" | null): string {
  switch (phase) {
    case "queue":
      return "idle";
    case "selected":
      return "ticket T-1042";
    case "limited":
      return "rate-limited";
    case "reading":
    case "drafting":
      return "drafting";
    case "proposing":
      return "waiting on you";
    case "settled":
      return decision === "denied" ? "denied" : "approved";
    default:
      return "ready";
  }
}

/** The streaming draft: text up to the reveal point, citation chips where
 *  the revealed text has already passed them — the template's teal markers,
 *  static here because a hover popover mid-replay is nobody's goal. */
function StreamingDraft({ ratio, settled }: { ratio: number; settled: boolean }) {
  const cut = settled ? Infinity : Math.floor(DRAFT_TOTAL * ratio);
  return (
    <p className="whitespace-pre-wrap text-[12.5px] leading-6 text-zinc-800 dark:text-zinc-200">
      {DRAFT.map((segment, i) => {
        if ("cite" in segment) {
          /* A chip renders only once its passage has fully arrived — i.e.
             the cut has reached the text that precedes the marker. */
          if (cut < DRAFT_STARTS[i]) return null;
          return (
            <span
              key={i}
              className="mx-0.5 inline-flex h-[1.1rem] min-w-[1.1rem] translate-y-[0.1em] items-center justify-center rounded px-0.5 bg-teal-100 text-[10px] font-medium tabular-nums text-teal-900 dark:bg-teal-400/20 dark:text-teal-200"
            >
              {segment.cite}
            </span>
          );
        }
        const remaining = cut - DRAFT_STARTS[i];
        if (remaining <= 0) return null;
        const shown =
          remaining >= segment.text.length
            ? segment.text
            : sliceTo(segment.text, remaining / segment.text.length);
        if (!shown) return null;
        return <React.Fragment key={i}>{shown}</React.Fragment>;
      })}
      {!settled && (
        <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
      )}
    </p>
  );
}

export function SupportCopilotDemo({ caption = true }: { caption?: boolean }) {
  const [step, setStep] = React.useState(0);
  /* null until the refund gate resolves — by timeout (approved, the scripted
     default) or by click (either way). Reset with the loop. */
  const [decision, setDecision] = React.useState<"approved" | "denied" | null>(null);
  /* Tagged with the step it belongs to, so moving on resets the reveal
     without an effect having to zero it. */
  const [progress, setProgress] = React.useState({ step: 0, value: 0 });

  const frameRef = React.useRef<HTMLDivElement>(null);
  const threadScrollRef = React.useRef<HTMLDivElement>(null);
  const draftScrollRef = React.useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);

  /* Reduced motion gets the finished frame — draft cited, refund approved,
     reply in the composer — with nothing moving. The frame's point is what
     the console looks like, and that survives being still. */
  const phase = reduced ? "inserted" : TIMELINE[step].phase;
  const resolvedDecision = reduced ? "approved" : decision;
  const ratio = progress.step === step ? progress.value : 0;
  const status = statusFor(phase, resolvedDecision);
  const busy = status === "drafting" || status === "waiting on you" || status === "rate-limited";

  const playing = inView && !reduced;

  /* The step machine. One timeout per screen, cleared on every change, so
     scrolling away mid-ticket cannot leave a stray timer behind. The gate is
     on the same clock as everything else — this demo loops unattended, so
     the card cannot wait forever. */
  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => {
      setStep((s) => {
        const next = (s + 1) % TIMELINE.length;
        if (next === 0) setDecision(null);
        return next;
      });
    }, TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  /* The reveal for the streaming draft. Driven off elapsed time rather than
     a per-character timer: a backgrounded tab resumes at the right place
     instead of finishing a burst of queued ticks. */
  React.useEffect(() => {
    if (!playing || phase !== "drafting") return;
    const total = TIMELINE[step].ms;
    const started = performance.now();
    const id = window.setInterval(() => {
      setProgress({ step, value: Math.min(1, (performance.now() - started) / total) });
    }, 40);
    return () => window.clearInterval(id);
  }, [step, phase, playing]);

  /* Both columns follow their content down as it grows. */
  React.useEffect(() => {
    for (const ref of [threadScrollRef, draftScrollRef]) {
      const el = ref.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [phase, ratio]);

  function replay() {
    setProgress({ step: 0, value: 0 });
    setDecision(null);
    setStep(0);
  }

  /* A click on the gate resolves it immediately, whichever way it goes. */
  function decide(approved: boolean) {
    setDecision(approved ? "approved" : "denied");
    setStep(TIMELINE.findIndex((t) => t.phase === "settled"));
  }

  const ticketPicked = phase !== "queue";
  const showError = phase === "limited";
  const showThinking = phase === "reading";
  const showDraft = phase === "drafting" || phase === "proposing" || phase === "settled" || phase === "inserted";
  const draftStreaming = phase === "drafting";
  const showGate = phase === "proposing" || phase === "settled" || phase === "inserted";
  const gateSettled = phase !== "proposing";
  const showSources = phase === "settled" || phase === "inserted";
  const inserted = phase === "inserted";
  const approved = resolvedDecision !== "denied";

  return (
    <div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border border-(--border)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Window chrome. The pill earns its space: the refund gate is a
            status the model cannot move past, and naming it is half the
            demo. */}
        <div className="flex items-center gap-3 border-b border-(--border) bg-(--muted) px-3 py-2">
          <div className="flex gap-1.5" aria-hidden>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full opacity-60" style={{ background: c }} />
            ))}
          </div>
          <span className="hidden truncate text-[11px] text-(--muted-foreground) sm:inline">
            localhost:3000
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--border) bg-(--card) px-2 py-0.5 font-mono text-[10px] text-(--muted-foreground)">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background:
                  status === "waiting on you"
                    ? "#f59e0b"
                    : status === "rate-limited"
                      ? "#ef4444"
                      : busy
                        ? "var(--primary)"
                        : "#22c55e",
              }}
              aria-hidden
            />
            {status}
          </span>
          <button
            type="button"
            onClick={replay}
            className="shrink-0 rounded-md border border-(--border) bg-(--card) px-2 py-0.5 text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Replay
          </button>
        </div>

        {/* From here down it is the app, in the app's own palette rather than
            the site's — queue, thread, copilot, the template's three
            columns, minus its narrow-screen tabs. */}
        <div className="flex h-[26rem] flex-col bg-white text-zinc-900 sm:h-[30rem] dark:bg-zinc-950 dark:text-zinc-100">
          <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-3.5 py-2 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                M
              </span>
              <span className="text-[12px] font-semibold tracking-tight">Meridian Support Copilot</span>
            </div>
            <span className="hidden text-[10px] text-zinc-400 sm:inline">
              Drafts are grounded in the KB. Refunds wait for a human.
            </span>
          </header>

          <div className="flex min-h-0 flex-1">
            {/* Queue. First thing to go when the frame gets tight — the demo
                is about the other two columns. */}
            <aside className="hidden w-52 shrink-0 overflow-y-auto border-r border-zinc-200 sm:block dark:border-zinc-800">
              <ul className="space-y-1 p-2">
                {TICKETS.map((ticket, i) => {
                  const active = ticketPicked && i === 0;
                  return (
                    <li key={ticket.id}>
                      <button
                        type="button"
                        onClick={replay}
                        aria-current={active ? "true" : undefined}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          active
                            ? "border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"
                            : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_STYLES[ticket.status]}`} aria-hidden />
                          <span className="text-[11px] font-medium tabular-nums text-zinc-400">{ticket.id}</span>
                          <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_STYLES[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-[12px] font-medium text-zinc-900 dark:text-zinc-100">
                          {ticket.subject}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                          {ticket.customer} · {ticket.status}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Thread */}
            <section className="flex min-w-0 flex-1 flex-col">
              {!ticketPicked ? (
                <p className="p-6 text-[13px] text-zinc-500">Pick a ticket from the queue.</p>
              ) : (
                <>
                  <header className="shrink-0 border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
                    <h2 className="truncate text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      Charged twice for order M-88103
                    </h2>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      Priya Raman · priya.raman@example.com · T-1042
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-1 text-[11px] tabular-nums text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">M-88103</span>
                        $189.00 USD · Cascade 65L pack
                      </span>
                    </div>
                  </header>

                  <div ref={threadScrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
                    {THREAD.map((message, i) => (
                      <div key={i} className={`flex ${message.author === "customer" ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[12.5px] leading-6 ${
                            message.author === "customer"
                              ? "rounded-tl-md border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                              : "rounded-br-md bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                          }`}
                        >
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                            {message.name}
                          </p>
                          <p className="whitespace-pre-wrap">{message.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* The reply composer. Empty until the draft is inserted —
                      "Insert into reply" is the beat where the copilot hands
                      the work back to the agent. */}
                  <div className="shrink-0 border-t border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
                    <div
                      className={`max-h-24 overflow-y-auto rounded-xl border px-3 py-2 text-[12px] leading-5 ${
                        inserted
                          ? "border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
                          : "border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500"
                      }`}
                    >
                      {inserted ? (approved ? REPLY_APPROVED : REPLY_DENIED) : "Reply to the customer… (or generate a draft on the right)"}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">Demo only — replies stay in this tab.</span>
                      <button
                        type="button"
                        disabled={!inserted}
                        onClick={replay}
                        className="inline-flex h-7 items-center rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-30 dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        Send reply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Copilot */}
            <aside className="flex w-[46%] shrink-0 flex-col border-l border-zinc-200 sm:w-80 dark:border-zinc-800">
              <header className="shrink-0 border-b border-zinc-200 px-3.5 py-2.5 dark:border-zinc-800">
                <h2 className="text-[12px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Draft reply
                </h2>
                <p className="mt-0.5 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
                  Grounded in the knowledge base, cited inline. Nothing is sent — or refunded —
                  without you.
                </p>
              </header>

              <div ref={draftScrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3.5 py-3">
                {!ticketPicked ? (
                  <p className="pt-2 text-[12px] text-zinc-500">
                    The copilot drafts against the selected ticket.
                  </p>
                ) : (
                  <>
                    {/* The failure, once, and then the retry that works. An
                        error state nobody ever sees is a component nobody
                        maintains. */}
                    {showError && (
                      <ErrorMessage
                        severity="rate-limit"
                        title="The draft request was rate-limited"
                        message="The model endpoint asked us to slow down. Retrying automatically."
                        retrying
                      />
                    )}

                    {showThinking && <ThinkingIndicator label="Reading the ticket and the KB" />}

                    {showDraft && <StreamingDraft ratio={ratio} settled={!draftStreaming} />}

                    {/* The gate. The card, not the prose, is the decision:
                        amount, order, reason, buttons. */}
                    {showGate && (
                      <ApprovalRequest
                        title="Process refund — $189.00"
                        requester="The copilot"
                        description={
                          gateSettled
                            ? undefined
                            : "Refunds move money, so the model can only propose them. Approving executes this refund; denying tells the model to revise."
                        }
                        detail={gateSettled ? undefined : REFUND_DETAIL}
                        status={gateSettled ? (approved ? "approved" : "denied") : "pending"}
                        onAllow={gateSettled ? undefined : () => decide(true)}
                        onDeny={gateSettled ? undefined : () => decide(false)}
                      />
                    )}

                    {/* The sources, once the draft has settled — what was
                        retrieved, and which passages the reply actually
                        used. Not linkable: a marketing frame has no KB to
                        send anyone to. */}
                    {showSources && (
                      <CitationList citations={CITATIONS} linkable={false} className="rounded-xl border border-zinc-200 bg-zinc-50/60 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40" />
                    )}

                    {(phase === "settled" || inserted) && (
                      <button
                        type="button"
                        onClick={() =>
                          setStep(TIMELINE.findIndex((t) => t.phase === "inserted"))
                        }
                        disabled={inserted}
                        className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-zinc-900 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        {inserted ? "Inserted — edit in the composer" : "Insert into reply"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
          A scripted replay of one ticket — the refund card is real and clickable, but it also
          resolves on its own so the loop continues; there is no model and no route behind this
          page. In the template, nothing is refunded or sent except on your click.
        </p>
      )}
    </div>
  );
}
