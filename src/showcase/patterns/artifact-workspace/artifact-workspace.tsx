"use client";

import * as React from "react";
import { PromptInput } from "../../prompt-input/prompt-input";
import { StreamingMessage } from "../../streaming-message/streaming-message";
import { ConversationSidebar, type ConversationGroup } from "../../conversation-sidebar/conversation-sidebar";
import { ResponseVersions, type ResponseVersion } from "../../response-versions/response-versions";
import { ArtifactPreview, type ArtifactStatus } from "../../artifact-preview/artifact-preview";

/**
 * Chat on the left, generated output on the right — the artifact workspace.
 *
 * The flow this pattern exists to demonstrate:
 *
 * 1. **The artifact opens from the answer.** The assistant's message names
 *    what it made and carries an "Open artifact" affordance; the panel is a
 *    consequence of the conversation, not a separate app.
 * 2. **Streaming is visible but the chrome never moves.** The panel opens
 *    in its final position, streams its source, then settles — nothing
 *    re-layouts mid-generation.
 * 3. **A new artifact version must not yank the reader.** Revisions append;
 *    the panel follows only while the reader is already on the latest.
 * 4. **A broken artifact does not break the chat.** v3 fails to render, the
 *    panel says so, and the conversation carries on with v2 untouched.
 * 5. **On a narrow screen the artifact is a place you visit.** A floating
 *    button opens it as an overlay; closing it returns to the chat.
 */

/* ------------------------------------------------------------------ */
/* Script                                                              */
/* ------------------------------------------------------------------ */

type Turn = {
  id: number;
  role: "user" | "assistant";
  text: string;
  /** This message created or revised the artifact — show its open affordance. */
  artifactRef?: boolean;
};

const CONVERSATIONS: ConversationGroup[] = [
  {
    id: "today",
    label: "Today",
    conversations: [
      { id: "w1", title: "Signup chart artifact", updatedAt: "2m" },
      { id: "w2", title: "Landing page copy", updatedAt: "3h" },
    ],
  },
  {
    id: "week",
    label: "Previous 7 days",
    conversations: [{ id: "w3", title: "Quarterly report draft", updatedAt: "3d" }],
  },
];

const CHART_V1 = `export function SignupChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2">
      {data.map((v, i) => (
        <div key={i} style={{ height: (v / max) * 160 }} className="w-10 rounded-t bg-blue-500" />
      ))}
    </div>
  );
}`;

const CHART_V2 = `export function SignupChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const total = data.reduce((a, b) => a + b, 0);
  return (
    <figure>
      <div className="flex items-end gap-2">
        {data.map((v, i) => (
          <div key={i} style={{ height: (v / max) * 160 }} className="w-10 rounded-t bg-blue-500" />
        ))}
      </div>
      <figcaption>Total signups: {total.toLocaleString()}</figcaption>
    </figure>
  );
}`;

const CHART_V3_BROKEN = `export function SignupChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const total = data.reduce((a, b) => a + b, 0);
  return (
    <figure>
      <Trendline points={data.toPairs()} />`;

const REPLY_V1 =
  "Here's the signup chart as a small React component — it's streaming into the artifact panel. Open it to watch the source settle, then page between Preview and Code.";
const REPLY_V1_ALT =
  "Done — the chart component is in the artifact panel on the right. The source is still streaming in; the panel's chrome stays put while it does.";
const REPLY_V2 =
  "Added the totals caption and bumped the artifact to v2. If you were reading v1, the panel won't move you — the pager shows the new version landed.";
const REPLY_ERROR =
  "That revision broke the render — the panel shows the failure, and v2 is untouched. The chat is fine; ask me to fix the component.";
const REPLY_GENERIC =
  "The artifact stays as it is until you ask for a change. Try “add a totals caption” or ask me to revise the chart.";

/* ------------------------------------------------------------------ */
/* Artifact preview mock                                               */
/* ------------------------------------------------------------------ */

function ChartMock({ values, caption }: { values: number[]; caption?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6">
      <div className="flex h-40 items-end gap-2">
        {values.map((v, i) => (
          <div
            key={i}
            style={{ height: `${(v / max) * 100}%` }}
            className="w-10 rounded-t-md bg-blue-500/80 dark:bg-blue-400/80"
          />
        ))}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{caption ?? "Monthly signups"}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Artifact state                                                      */
/* ------------------------------------------------------------------ */

type Artifact = {
  open: boolean;
  status: ArtifactStatus;
  title: string;
  code: string;
  values: number[];
  caption?: string;
  versions: { id: string }[];
  currentVersionId: string;
  errorMessage?: string;
};

const CLOSED_ARTIFACT: Artifact = {
  open: false,
  status: "ready",
  title: "signup-chart.tsx",
  code: "",
  values: [],
  versions: [],
  currentVersionId: "",
};

/** Reveal the source progressively — the panel's own streaming. */
function streamCode(target: string, tick: (code: string) => void, done: () => void) {
  let i = 0;
  const step = Math.max(12, Math.floor(target.length / 36));
  const timer = window.setInterval(() => {
    i = Math.min(target.length, i + step);
    tick(target.slice(0, i));
    if (i >= target.length) {
      window.clearInterval(timer);
      done();
    }
  }, 50);
}

/* ------------------------------------------------------------------ */
/* Pattern                                                             */
/* ------------------------------------------------------------------ */

export function ArtifactWorkspacePattern() {
  const [conversations, setConversations] = React.useState(CONVERSATIONS);
  const [activeConvo, setActiveConvo] = React.useState("w1");
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [pending, setPending] = React.useState<string | null>(null);
  const [answerVersions, setAnswerVersions] = React.useState<ResponseVersion[]>([]);
  const [artifact, setArtifact] = React.useState<Artifact>(CLOSED_ARTIFACT);
  const [overlay, setOverlay] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const idRef = React.useRef(1);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, pending, answerVersions]);

  function assistantSay(text: string, artifactRef?: boolean) {
    setTurns((t) => [...t, { id: idRef.current++, role: "assistant", text, artifactRef }]);
  }

  /** Stream a new artifact version into the panel. Appends, never replaces,
   *  and only moves the reader if they were already on the latest version. */
  function reviseArtifact(fullCode: string, values: number[], caption?: string, breakAt?: number) {
    setArtifact((a) => {
      const id = `v${a.versions.length + 1}`;
      const last = a.versions[a.versions.length - 1]?.id;
      const wasAtLatest = a.versions.length === 0 || a.currentVersionId === last;
      return {
        ...a,
        open: true,
        status: "streaming",
        code: "",
        errorMessage: undefined,
        versions: [...a.versions, { id }],
        currentVersionId: wasAtLatest ? id : a.currentVersionId,
      };
    });
    const limit = breakAt ?? fullCode.length;
    streamCode(fullCode.slice(0, limit), (code) => setArtifact((a) => ({ ...a, code })), () => {
      if (breakAt) {
        setArtifact((a) => ({
          ...a,
          status: "error",
          errorMessage: "v3 threw while rendering: data.toPairs is not a function.",
        }));
      } else {
        setArtifact((a) => ({ ...a, status: "ready", values, caption }));
      }
    });
  }

  function submit(value: string) {
    setTurns((t) => [...t, { id: idRef.current++, role: "user", text: value }]);
    const step = turns.filter((t) => t.role === "assistant").length;

    window.setTimeout(() => {
      if (step === 0) {
        setPending(REPLY_V1);
      } else if (step === 1) {
        setPending(REPLY_V2);
      } else if (step === 2) {
        setPending(REPLY_ERROR);
      } else {
        setPending(REPLY_GENERIC);
      }
    }, 450);
  }

  function onStreamComplete() {
    if (!pending) return;
    const text = pending;
    setPending(null);
    if (text === REPLY_V1) {
      /* The first answer is regenerable — the version stack lives on the
         message, the artifact opens when the answer lands. */
      setAnswerVersions([{ id: "a1", status: "ready", content: <StreamingMessage text={text} /> }]);
      reviseArtifact(CHART_V1, [3, 5, 4]);
    } else if (text === REPLY_V2) {
      assistantSay(text, true);
      reviseArtifact(CHART_V2, [3, 5, 4, 7, 6], "Total: 25,410");
    } else if (text === REPLY_ERROR) {
      assistantSay(text);
      reviseArtifact(CHART_V3_BROKEN, [], undefined, Math.floor(CHART_V3_BROKEN.length * 0.9));
    } else {
      assistantSay(text);
    }
  }

  function regenerateAnswer() {
    const id = `a${idRef.current++}`;
    setAnswerVersions((vs) => [
      ...vs,
      {
        id,
        status: "generating",
        content: (
          <StreamingMessage
            key={id}
            text={REPLY_V1_ALT}
            isStreaming
            speed={2}
            onComplete={() =>
              setAnswerVersions((vs2) => vs2.map((v) => (v.id === id ? { ...v, status: "ready" } : v)))
            }
          />
        ),
      },
    ]);
  }

  function newChat() {
    const id = `w${idRef.current++}`;
    setConversations((gs) =>
      gs.map((g, i) =>
        i === 0 ? { ...g, conversations: [{ id, title: "Untitled chat", updatedAt: "now" }, ...g.conversations] } : g,
      ),
    );
    setActiveConvo(id);
    setTurns([]);
    setPending(null);
    setAnswerVersions([]);
    setArtifact(CLOSED_ARTIFACT);
    setOverlay(false);
  }

  function renderArtifactPanel(onClose: () => void) {
    return (
      <ArtifactPreview
        title={artifact.title}
        type="chart"
        language="tsx"
        status={artifact.status}
        code={artifact.code}
        errorMessage={artifact.errorMessage}
        preview={
          artifact.values.length > 0 ? (
            <ChartMock values={artifact.values} caption={artifact.caption} />
          ) : undefined
        }
        versions={artifact.versions}
        currentVersionId={artifact.currentVersionId}
        onVersionChange={(id) => setArtifact((a) => ({ ...a, currentVersionId: id }))}
        onClose={onClose}
        className="h-full rounded-none border-0"
      />
    );
  }

  const openArtifactChip = (
    <button
      type="button"
      onClick={() => setOverlay(true)}
      className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M15 3v18" />
      </svg>
      Open artifact
    </button>
  );

  return (
    <div className="relative flex h-[640px] overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Conversation history */}
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 md:block">
        <ConversationSidebar
          groups={conversations}
          activeId={activeConvo}
          onNewChat={newChat}
          onSelect={setActiveConvo}
        />
      </aside>

      {/* Chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Artifact Workspace</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              Ask for a chart — it opens in the panel
            </p>
          </div>
          {artifact.open && (
            <button
              type="button"
              onClick={() => setOverlay(true)}
              className="shrink-0 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
            >
              View artifact
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {turns.length === 0 && answerVersions.length === 0 && !pending && (
            <p className="pt-16 text-center text-[13px] leading-6 text-zinc-400 dark:text-zinc-500">
              Ask for a signup chart.
              <br />
              The answer builds it in the artifact panel — then revise it, then break it.
            </p>
          )}

          {answerVersions.length > 0 && (
            <div>
              <ResponseVersions versions={answerVersions} onRegenerate={regenerateAnswer} />
              {openArtifactChip}
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
                {t.artifactRef && openArtifactChip}
              </div>
            ),
          )}

          {pending && (
            <StreamingMessage text={pending} isStreaming speed={2} onComplete={onStreamComplete} />
          )}
        </div>

        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <PromptInput placeholder="Ask for a signup chart…" onSubmit={submit} />
        </div>
      </div>

      {/* Artifact panel — docked on wide screens, an overlay below lg. */}
      {artifact.open && (
        <aside className="hidden w-[44%] shrink-0 border-l border-zinc-200 dark:border-zinc-800 lg:block">
          {renderArtifactPanel(() => setArtifact((a) => ({ ...a, open: false })))}
        </aside>
      )}
      {artifact.open && overlay && (
        <div className="absolute inset-0 z-10 lg:hidden">
          {renderArtifactPanel(() => setOverlay(false))}
        </div>
      )}
    </div>
  );
}
