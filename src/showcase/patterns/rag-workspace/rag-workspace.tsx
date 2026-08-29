"use client";

import * as React from "react";
import { FileUpload, type FileUploadStatus } from "../../file-upload/file-upload";
import { ContextFiles } from "../../context-files/context-files";
import { SourceList, type RetrievedSource } from "../../source-list/source-list";
import { CitationList, type Citation } from "../../citation-ui/citation-ui";
import { ContextUsage } from "../../context-usage/context-usage";
import { PromptInput } from "../../prompt-input/prompt-input";
import { StreamingMessage } from "../../streaming-message/streaming-message";

/**
 * "Ask your own documents" — the RAG workspace.
 *
 * What this pattern exists to show:
 *
 * 1. **An answer is only as good as its sources.** Every grounded answer
 *    carries citations, and the retrieved passages (with scores and the
 *    floor) are inspectable — trust is shown, not asserted.
 * 2. **"Not found" is a first-class answer.** When nothing scores above the
 *    floor, the workspace says so and shows what was considered, instead of
 *    letting the model guess.
 * 3. **Context is a budget.** The usage bar turns the context window into
 *    something the user can spend deliberately — a big upload visibly moves
 *    it toward the limit.
 * 4. **Removing a document has consequences.** If an existing answer cited
 *    it, the workspace says which answers just lost their grounding.
 *
 * Boundary with the Pro RAG template: this is mock state and a scripted
 * flow. Ingestion, chunking, embeddings and streaming citation offsets are
 * the template's engineering, not this file's.
 */

/* ------------------------------------------------------------------ */
/* Script                                                              */
/* ------------------------------------------------------------------ */

type Doc = {
  id: string;
  name: string;
  size: string;
  tokens: number;
  status: "parsing" | "ready" | "failed";
};

type Turn = {
  id: number;
  role: "user" | "assistant";
  text: string;
  kind?: "cited" | "not-found" | "generic";
};

const WINDOW_TOKENS = 128_000;
const RESERVE_TOKENS = 4_000;
const SYSTEM_TOKENS = 1_800;
const SCORE_FLOOR = 0.5;

const INITIAL_DOCS: Doc[] = [
  { id: "d1", name: "employee-handbook.pdf", size: "2.1 MB", tokens: 12_400, status: "ready" },
];

const HANDBOOK_CITATIONS: Citation[] = [
  {
    id: 1,
    title: "employee-handbook.pdf · Vacation policy, p.12",
    url: "#handbook-p12",
    snippet: "Full-time employees accrue 15 days of paid vacation per calendar year.",
  },
  {
    id: 2,
    title: "employee-handbook.pdf · Rollover rules, p.13",
    url: "#handbook-p13",
    snippet: "Up to 5 unused vacation days roll over and must be used before March 31.",
  },
  {
    id: 3,
    title: "employee-handbook.pdf · Company calendar, p.4",
    url: "#handbook-p4",
    snippet: "The December shutdown week is paid and does not count against vacation balance.",
  },
];

const CITED_SOURCES: RetrievedSource[] = [
  { id: "s1", title: "employee-handbook.pdf · p.12", passage: "Full-time employees accrue 15 days of paid vacation per calendar year, increasing to 20 days after three years of continuous employment.", score: 0.82 },
  { id: "s2", title: "employee-handbook.pdf · p.13", passage: "Up to 5 unused vacation days roll over into the following year and must be used before March 31, after which they expire.", score: 0.74 },
  { id: "s3", title: "employee-handbook.pdf · p.4", passage: "The company observes a shutdown week in late December. This time is paid and does not count against the vacation balance.", score: 0.61 },
  { id: "s4", title: "employee-handbook.pdf · p.21", passage: "Remote work is available up to three days per week with manager approval.", score: 0.31 },
];

const NOT_FOUND_SOURCES: RetrievedSource[] = [
  { id: "s5", title: "employee-handbook.pdf · p.30", passage: "New hires receive a laptop and access credentials on their first day.", score: 0.34 },
  { id: "s6", title: "employee-handbook.pdf · p.18", passage: "Business travel expenses are reimbursed within 14 days of report submission.", score: 0.29 },
  { id: "s7", title: "employee-handbook.pdf · p.7", passage: "The office is open from 8am to 7pm on weekdays.", score: 0.18 },
];

const ANSWER_CITED =
  "Employees accrue 15 days of paid vacation per year, rising to 20 days after three years [1]. Up to 5 unused days roll over, but they expire if not used before March 31 [2]. Separately, the December shutdown week is paid time and never touches the vacation balance [3].";
const ANSWER_NOT_FOUND =
  "I couldn't find that in the documents you've shared. The closest passages — onboarding and expenses — scored below the relevance floor, so I won't guess. Try uploading a document that covers it, or rephrase using terms the document itself would use.";
const ANSWER_GENERIC =
  "I answer only from the documents currently in context. Ask about the handbook, upload another document on the left, or remove one to see what happens to its answers.";

/* ------------------------------------------------------------------ */
/* Pattern                                                             */
/* ------------------------------------------------------------------ */

export function RagWorkspacePattern() {
  const [docs, setDocs] = React.useState<Doc[]>(INITIAL_DOCS);
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [pending, setPending] = React.useState<{ text: string; kind: Turn["kind"] } | null>(null);
  const [removedNotice, setRemovedNotice] = React.useState<string | null>(null);
  const [upload, setUpload] = React.useState<{ name: string; size: string; status: FileUploadStatus; progress: number } | null>(null);
  const [docsOpen, setDocsOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const idRef = React.useRef(1);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, pending]);

  const readyDocs = docs.filter((d) => d.status === "ready");
  const convoTokens = 900 + turns.length * 420;
  const usedTokens = SYSTEM_TOKENS + convoTokens + readyDocs.reduce((s, d) => s + d.tokens, 0);
  const nearLimit = usedTokens / WINDOW_TOKENS > 0.8;

  function submit(value: string) {
    setTurns((t) => [...t, { id: idRef.current++, role: "user", text: value }]);
    const step = turns.filter((t) => t.role === "assistant").length;
    window.setTimeout(() => {
      if (readyDocs.length === 0) {
        setPending({ text: ANSWER_NOT_FOUND, kind: "not-found" });
      } else if (step === 0) {
        setPending({ text: ANSWER_CITED, kind: "cited" });
      } else if (step === 1) {
        setPending({ text: ANSWER_NOT_FOUND, kind: "not-found" });
      } else {
        setPending({ text: ANSWER_GENERIC, kind: "generic" });
      }
    }, 450);
  }

  function onStreamComplete() {
    if (!pending) return;
    setTurns((t) => [...t, { id: idRef.current++, role: "assistant", text: pending.text, kind: pending.kind }]);
    setPending(null);
  }

  /** Real file names, simulated parse — the pattern never reads file bytes. */
  function onSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const size = file.size > 1_000_000 ? `${(file.size / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1000))} KB`;
    setUpload({ name: file.name, size, status: "uploading", progress: 0 });

    let p = 0;
    const timer = window.setInterval(() => {
      p = Math.min(100, p + 14);
      setUpload((u) => (u ? { ...u, progress: p } : u));
      if (p >= 100) {
        window.clearInterval(timer);
        const tokens = Math.min(96_000, Math.max(2_000, Math.round(file.size / 40)));
        setDocs((d) => [...d, { id: `d${idRef.current++}`, name: file.name, size, tokens, status: "ready" }]);
        setUpload(null);
      }
    }, 160);
  }

  function removeDoc(doc: Doc) {
    setDocs((ds) => ds.filter((d) => d.id !== doc.id));
    const cited = turns.some((t) => t.kind === "cited");
    if (doc.id === "d1" && cited) {
      setRemovedNotice(`"${doc.name}" was removed — the vacation answer above cited it and is no longer grounded.`);
    } else {
      setRemovedNotice(`"${doc.name}" was removed from context.`);
    }
  }

  const docsPanel = (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Documents</p>
      <FileUpload
        status={upload?.status ?? "idle"}
        progress={upload?.progress}
        fileName={upload?.name}
        fileSize={upload?.size}
        accept=".pdf,.md,.txt,.csv"
        onSelect={onSelect}
        onRemove={() => setUpload(null)}
      />
      <ContextFiles
        title="In context"
        files={readyDocs.map((d) => ({ name: d.name, detail: `${d.size} · ≈ ${(d.tokens / 1000).toFixed(1)}k tokens` }))}
        onRemove={(name) => {
          const doc = docs.find((d) => d.name === name);
          if (doc) removeDoc(doc);
        }}
      />
      <ContextUsage
        window={WINDOW_TOKENS}
        reserve={RESERVE_TOKENS}
        estimated
        segments={[
          { label: "System", tokens: SYSTEM_TOKENS },
          ...readyDocs.map((d, i) => ({ label: d.name, tokens: d.tokens, evictionRank: i + 2 })),
          { label: "Conversation", tokens: convoTokens, evictionRank: 1 },
        ]}
      />
      {nearLimit && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          Context is nearly full — the oldest documents are evicted first when it overflows.
        </p>
      )}
    </div>
  );

  return (
    <div className="relative flex h-[640px] overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Documents rail */}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 md:block">
        {docsPanel}
      </aside>

      {/* Q&A */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Document Q&amp;A</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              Answers only from your documents, with receipts
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDocsOpen(true)}
            className="shrink-0 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden"
          >
            Documents ({readyDocs.length})
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {turns.length === 0 && !pending && (
            <p className="pt-16 text-center text-[13px] leading-6 text-zinc-400 dark:text-zinc-500">
              Ask about the vacation policy — the answer cites its passages.
              <br />
              Then ask something the handbook doesn&apos;t cover.
            </p>
          )}

          {removedNotice && (
            <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <span>{removedNotice}</span>
              <button
                type="button"
                onClick={() => setRemovedNotice(null)}
                aria-label="Dismiss"
                className="shrink-0 rounded px-1 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                ✕
              </button>
            </div>
          )}

          {turns.map((t) =>
            t.role === "user" ? (
              <div key={t.id} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-zinc-900 px-4 py-3 text-[15px] leading-6 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {t.text}
                </div>
              </div>
            ) : (
              <div key={t.id}>
                <StreamingMessage text={t.text} />
                {t.kind === "cited" && (
                  <div className="mt-2">
                    <CitationList citations={HANDBOOK_CITATIONS} />
                  </div>
                )}
                {(t.kind === "cited" || t.kind === "not-found") && (
                  <details className="mt-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                      {t.kind === "cited" ? "Retrieved passages (3 of 4 used)" : "Nothing passed the relevance floor"}
                    </summary>
                    <div className="border-t border-zinc-100 p-2 dark:border-zinc-800">
                      <SourceList sources={t.kind === "cited" ? CITED_SOURCES : NOT_FOUND_SOURCES} floor={SCORE_FLOOR} />
                    </div>
                  </details>
                )}
              </div>
            ),
          )}

          {pending && (
            <StreamingMessage text={pending.text} isStreaming speed={2} onComplete={onStreamComplete} />
          )}
        </div>

        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <PromptInput
            placeholder={readyDocs.length === 0 ? "Upload a document first…" : "Ask your documents…"}
            onSubmit={submit}
          />
        </div>
      </div>

      {/* Documents as an overlay on narrow screens */}
      {docsOpen && (
        <div className="absolute inset-0 z-10 bg-white dark:bg-zinc-900 md:hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Documents</p>
            <button
              type="button"
              onClick={() => setDocsOpen(false)}
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back to chat
            </button>
          </div>
          {docsPanel}
        </div>
      )}
    </div>
  );
}
