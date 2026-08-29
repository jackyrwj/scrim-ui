"use client";

import * as React from "react";
import { ConversationSidebar, type ConversationGroup } from "../../conversation-sidebar/conversation-sidebar";
import { ContextPicker, type ContextItem } from "../../context-picker/context-picker";
import { CitationList, type Citation } from "../../citation-ui/citation-ui";
import { SourceList, type RetrievedSource } from "../../source-list/source-list";
import { ConfidenceAnswer } from "../../confidence-answer/confidence-answer";
import { InlineCorrection } from "../../inline-correction/inline-correction";
import { ApprovalRequest, type ApprovalState } from "../../approval-request/approval-request";
import { ResponseRating, type Rating } from "../../response-rating/response-rating";
import { StreamingMessage } from "../../streaming-message/streaming-message";
import { PromptInput } from "../../prompt-input/prompt-input";

/**
 * A support copilot: the agent talks to customers, the copilot drafts the
 * grounded answers — and knows when to shut up.
 *
 * What this pattern exists to show:
 *
 * 1. **Grounded answers are inspectable.** Citations under the draft, the
 *    retrieved passages behind one disclosure, scores and the floor visible.
 * 2. **Low confidence is said out loud.** The second answer admits it might
 *    be mixing up legacy terms — and offers the exact thing to check.
 * 3. **Corrections feed the copilot, not the void.** The agent fixes the
 *    wrong fact inline; the original stays struck through as training data.
 * 4. **Money moves wait for a human.** The refund is drafted, but sending it
 *    is an approval gate — approve and deny both leave a receipt.
 * 5. **Every draft is rated.** Thumbs and reason chips are how the team
 *    learns which topics the copilot handles badly.
 */

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const SIDEBAR_GROUPS: ConversationGroup[] = [
  {
    id: "today",
    label: "Today",
    conversations: [
      { id: "t1042", title: "#1042 Refund request — Ana R.", updatedAt: "2m", pinned: true },
      { id: "t1041", title: "#1041 Invoice copy — D. Kim", updatedAt: "26m" },
      { id: "t1040", title: "#1040 Export fails on Safari", updatedAt: "1h" },
    ],
  },
  {
    id: "week",
    label: "Earlier this week",
    conversations: [
      { id: "t1039", title: "#1039 Plan downgrade question", updatedAt: "Tue" },
      { id: "t1038", title: "#1038 SSO setup help", updatedAt: "Mon" },
    ],
  },
];

const CONTEXT_SOURCES: ContextItem[] = [
  { id: "help", kind: "knowledge", title: "Help Center", detail: "214 articles", tokens: 0, recent: true },
  { id: "policy", kind: "file", title: "refund-policy-2026.pdf", detail: "12 pages", tokens: 3_800, recent: true },
  { id: "order", kind: "app", title: "Order #8182 — Billing", detail: "Stripe dashboard", tokens: 900 },
  { id: "wiki", kind: "knowledge", title: "Internal support wiki", detail: "Notion", status: "permission-required", tokens: 0 },
  { id: "macros", kind: "app", title: "Saved reply macros", detail: "38 macros", status: "unavailable" },
];

const CITATIONS: Citation[] = [
  {
    id: 1,
    title: "Refund policy — Help Center",
    url: "https://help.example.com/refunds",
    snippet: "Customers may request a full refund within 30 days of the charge date.",
  },
  {
    id: 2,
    title: "Refund policy §2.4",
    url: "https://help.example.com/refunds#timing",
    snippet: "Refunds are issued to the original payment method within 5–10 business days.",
  },
];

const RETRIEVED: RetrievedSource[] = [
  { id: "s1", title: "Refund policy §2.1", passage: "Customers may request a full refund within 30 days of the charge date, no questions asked.", score: 0.86 },
  { id: "s2", title: "Refund policy §2.4", passage: "Refunds are issued to the original payment method within 5–10 business days.", score: 0.74 },
  { id: "s3", title: "2023 policy archive", passage: "Legacy terms allowed a 14-day window for annual plans purchased before 2025.", score: 0.41 },
];

const ANSWER_CITED =
  "Ana is well inside the window: order #8182 was charged 18 days ago and the policy allows a full refund within 30 days [1]. You can approve this one — the money returns to her card in 5–10 business days [2].";

const ANSWER_LOW =
  "Her plan may still be under legacy terms. The 2023 archive mentions a 14-day window for annual plans purchased before 2025 — if that applies, this refund is 4 days too late.";

const HEDGE_LOW = "Check the plan's purchase date before quoting a window — the 2023 terms said 14 days, and I can't tell from here whether she renewed under the 2026 policy.";

const ANSWER_APPROVAL =
  "I've drafted the refund for order #8182: $48.20 back to card •• 4242. It clears the 30-day window with room to spare. Approve below and it goes out now.";

const GENERIC_ANSWER =
  "Based on the ticket history, Ana has been a customer since 2024 with no prior refunds. A short, warm confirmation with the 5–10 day timeline usually closes these well.";

/* ------------------------------------------------------------------ */
/* Pattern                                                             */
/* ------------------------------------------------------------------ */

type Turn = {
  id: string;
  role: "agent" | "copilot";
  text: string;
  kind?: "cited" | "low" | "approval" | "generic";
  streaming?: boolean;
};

export function SupportCopilotPattern() {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [submits, setSubmits] = React.useState(0);
  const [ratings, setRatings] = React.useState<Record<string, { rating?: Rating; submitted?: boolean }>>({});
  const [approval, setApproval] = React.useState<ApprovalState>("pending");
  const [correction, setCorrection] = React.useState<string | undefined>();
  const [contextSel, setContextSel] = React.useState<string[]>(["help", "policy"]);
  const [granted, setGranted] = React.useState<string[]>([]);

  const streaming = turns.some((t) => t.streaming);

  function submit(text: string) {
    if (streaming) return;
    const n = submits + 1;
    setSubmits(n);
    const kind: Turn["kind"] = n === 1 ? "cited" : n === 2 ? "low" : n === 3 ? "approval" : "generic";
    const answer =
      kind === "cited" ? ANSWER_CITED : kind === "low" ? ANSWER_LOW : kind === "approval" ? ANSWER_APPROVAL : GENERIC_ANSWER;
    setTurns((ts) => [
      ...ts,
      { id: `a${n}`, role: "agent", text },
      { id: `c${n}`, role: "copilot", text: answer, kind, streaming: true },
    ]);
  }

  function finishStreaming(id: string) {
    setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, streaming: false } : t)));
  }

  function rate(id: string, rating: Rating | undefined) {
    setRatings((r) => ({ ...r, [id]: { ...r[id], rating, submitted: rating ? r[id]?.submitted : false } }));
  }

  function submitDetail(id: string) {
    setRatings((r) => ({ ...r, [id]: { ...r[id], submitted: true } }));
  }

  const contextItems = CONTEXT_SOURCES.map((item) =>
    granted.includes(item.id) ? { ...item, status: "available" as const } : item,
  );

  return (
    <div className="flex h-[640px] overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Ticket rail */}
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 md:block">
        <ConversationSidebar
          groups={SIDEBAR_GROUPS}
          activeId="t1042"
          newChatLabel="New ticket"
          searchPlaceholder="Search tickets…"
          className="h-full"
        />
      </aside>

      {/* Copilot thread */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ticket #1042 — Refund request</p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            Customer: Ana R. · Pro plan since 2024 · Order #8182 · “I was charged but already cancelled”
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {turns.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center dark:border-zinc-700">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Paste the customer&#39;s message to get a grounded draft</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Answers cite the Help Center and refund policy — the copilot says when it&#39;s guessing.
              </p>
            </div>
          )}

          {turns.map((turn) =>
            turn.role === "agent" ? (
              <div key={turn.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-4 py-2.5 text-sm leading-6 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {turn.text}
                </p>
              </div>
            ) : turn.kind === "low" && !turn.streaming ? (
              /* Low-confidence drafts keep their own honest surface. */
              <div key={turn.id} className="space-y-2">
                <ConfidenceAnswer confidence="low" text={turn.text} hedge={HEDGE_LOW} />
                <div className="ml-1 space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Correct the copilot
                  </p>
                  <InlineCorrection
                    text="Legacy annual plans have a 14-day refund window."
                    correction={correction}
                    correctedBy="you"
                    onSubmit={(c) => setCorrection(c)}
                    onRevert={() => setCorrection(undefined)}
                  />
                </div>
                <ResponseRating
                  rating={ratings[turn.id]?.rating}
                  submitted={ratings[turn.id]?.submitted}
                  onRate={(r) => rate(turn.id, r)}
                  onSubmitDetail={() => submitDetail(turn.id)}
                  reasons={["Wrong policy", "Outdated terms", "Missed the question", "Too cautious"]}
                />
              </div>
            ) : (
              <div key={turn.id} className="space-y-2">
                <StreamingMessage
                  text={turn.text}
                  isStreaming={turn.streaming}
                  showActions={false}
                  speed={14}
                  onComplete={() => finishStreaming(turn.id)}
                />
                {!turn.streaming && (
                  <>
                    {turn.kind === "cited" && (
                      <>
                        <CitationList citations={CITATIONS} />
                        <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
                          <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                            Inspect retrieved passages
                          </summary>
                          <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
                            <SourceList sources={RETRIEVED} floor={0.5} />
                          </div>
                        </details>
                      </>
                    )}
                    {turn.kind === "approval" && (
                      <ApprovalRequest
                        title="Issue $48.20 refund to card •• 4242"
                        requester="Copilot"
                        description="Refund for order #8182 — within the 30-day window"
                        detail="Sends the refund immediately. This cannot be undone from the copilot."
                        status={approval}
                        onAllow={() => setApproval("approved")}
                        onDeny={() => setApproval("denied")}
                      />
                    )}
                    <ResponseRating
                      rating={ratings[turn.id]?.rating}
                      submitted={ratings[turn.id]?.submitted}
                      onRate={(r) => rate(turn.id, r)}
                      onSubmitDetail={() => submitDetail(turn.id)}
                      reasons={["Wrong policy", "Outdated terms", "Missed the question", "Too cautious"]}
                    />
                  </>
                )}
              </div>
            ),
          )}
        </div>

        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <ContextPicker
            className="mb-2"
            items={contextItems}
            selectedIds={contextSel}
            onSelectionChange={setContextSel}
            onRequestAccess={(item) => setGranted((g) => [...g, item.id])}
            triggerLabel="Add ticket context"
          />
          <PromptInput
            onSubmit={submit}
            placeholder="Paste the customer's message…"
            loading={streaming}
          />
        </div>
      </div>
    </div>
  );
}
