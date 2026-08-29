"use client";

import * as React from "react";
import { PromptInput } from "../../prompt-input/prompt-input";
import { StreamingMessage } from "../../streaming-message/streaming-message";
import { CitationList, type Citation } from "../../citation-ui/citation-ui";
import {
  ConversationSidebar,
  type ConversationGroup,
} from "../../conversation-sidebar/conversation-sidebar";
import {
  ResponseVersions,
  type ResponseVersion,
} from "../../response-versions/response-versions";
import {
  ContextPicker,
  type ContextItem,
} from "../../context-picker/context-picker";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Turn = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const INITIAL_CONVERSATIONS: ConversationGroup[] = [
  {
    id: "today",
    label: "Today",
    conversations: [
      { id: "t1", title: "Streaming UI patterns", updatedAt: "2m" },
      { id: "t2", title: "Claude model pricing", updatedAt: "1h" },
    ],
  },
  {
    id: "week",
    label: "Previous 7 days",
    conversations: [
      { id: "t3", title: "Agent approval UX", updatedAt: "2d" },
      { id: "t4", title: "Research: RAG citations", updatedAt: "4d" },
    ],
  },
];

const MODELS = [
  { id: "sonnet", name: "Claude Sonnet 5", hint: "Balanced", icon: <ClaudeMark /> },
  { id: "opus", name: "Claude Opus 5", hint: "Reasoning", icon: <ClaudeMark /> },
  { id: "haiku", name: "Claude Haiku 4.5", hint: "Fast", icon: <ClaudeMark /> },
];

const CONTEXT_SOURCES: ContextItem[] = [
  { id: "f1", kind: "file", title: "Q3-planning.md", detail: "docs/roadmap", tokens: 2400, recent: true },
  { id: "f2", kind: "file", title: "metrics.csv", detail: "Downloads", tokens: 9800 },
  { id: "w1", kind: "web", title: "AI SDK — useChat", detail: "sdk.vercel.ai/docs", tokens: 3100, recent: true },
  { id: "w2", kind: "web", title: "Pricing page draft", detail: "Notion · shared", status: "permission-required" },
  { id: "k1", kind: "knowledge", title: "Support handbook", detail: "142 articles", tokens: 12400 },
];

const SOURCES: Citation[] = [
  {
    id: 1,
    title: "Claude Fable 5 and Mythos 5",
    url: "https://www.anthropic.com/news/claude-fable-5-mythos-5",
    domain: "anthropic.com",
    snippet: "Fable 5 is the most advanced generally available Claude model.",
  },
  {
    id: 2,
    title: "Designing AI-native interfaces",
    url: "https://example.com/ai-native-ui",
    domain: "example.com",
    snippet: "A field guide to streaming, agent and reasoning states.",
  },
];

const REPLIES = [
  "Streaming answers feel instant because the first token lands in milliseconds. Keep the reveal smooth, offer a stop control, and only add citations after the claim is grounded.",
  "For agent UIs, show tool calls as they happen and gate irreversible actions behind approval. Transparency is what separates a trustworthy assistant from a black box.",
  "The model selector belongs at the point of composition. Let users pick per message, describe the trade-off, and never wipe their draft when they switch.",
];

/* Alternate greetings the regenerate loop cycles through. */
const GREETINGS = [
  "Hi — I'm your AI research assistant. Ask me anything, or attach files and I'll ground answers in them.",
  "Hello — ask me anything. I can search the web, read attachments, and cite what I find.",
  "Welcome back. Pick a model below and ask away — I'll show my sources when I use them.",
];

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

/**
 * The provider's mark, inlined so this pattern stays dependency-free. Swap it
 * for whichever providers your own model list uses.
 */
function ClaudeMark() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden className="shrink-0 fill-[#d97757]">
      <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* AIChatPattern                                                       */
/* ------------------------------------------------------------------ */

export function AIChatPattern() {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [pending, setPending] = React.useState<string | null>(null);
  const [showSources, setShowSources] = React.useState(false);
  const [conversations, setConversations] = React.useState(INITIAL_CONVERSATIONS);
  const [activeConvo, setActiveConvo] = React.useState("t1");
  const [contextSel, setContextSel] = React.useState<string[]>([]);
  const [contextGranted, setContextGranted] = React.useState<string[]>([]);
  /* The greeting doubles as the regenerate demo: it is a version stack, and
     the regenerate button appends a streaming v2 the reader can page back
     from. */
  const [greetingVersions, setGreetingVersions] = React.useState<ResponseVersion[]>([
    { id: "g1", status: "ready", content: <StreamingMessage text={GREETINGS[0]} /> },
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const idRef = React.useRef(2);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, pending]);

  function submit(value: string) {
    setTurns((t) => [...t, { id: idRef.current++, role: "user", text: value }]);
    setPending(null);
    setShowSources(false);
    const reply = REPLIES[idRef.current % REPLIES.length];
    window.setTimeout(() => setPending(reply), 500);
  }

  function onStreamComplete() {
    if (pending) {
      setTurns((t) => [...t, { id: idRef.current++, role: "assistant", text: pending }]);
      setPending(null);
      setShowSources(true);
    }
  }

  function regenerateGreeting() {
    const id = `g${idRef.current++}`;
    const text = GREETINGS[idRef.current % GREETINGS.length];
    setGreetingVersions((vs) => [
      ...vs,
      {
        id,
        status: "generating",
        content: (
          <StreamingMessage
            key={id}
            text={text}
            isStreaming
            speed={2}
            onComplete={() =>
              setGreetingVersions((vs2) =>
                vs2.map((v) => (v.id === id ? { ...v, status: "ready" } : v)),
              )
            }
          />
        ),
      },
    ]);
  }

  function newChat() {
    const id = `t${idRef.current++}`;
    setConversations((gs) =>
      gs.map((g, i) =>
        i === 0
          ? { ...g, conversations: [{ id, title: "Untitled chat", updatedAt: "now" }, ...g.conversations] }
          : g,
      ),
    );
    setActiveConvo(id);
    setTurns([]);
    setGreetingVersions([
      {
        id: `g${idRef.current++}`,
        status: "ready",
        content: <StreamingMessage text="New conversation started. What are you working on?" />,
      },
    ]);
    setPending(null);
    setShowSources(false);
  }

  const activeTitle =
    conversations.flatMap((g) => g.conversations).find((c) => c.id === activeConvo)?.title ?? "AI Chat";

  return (
    <div className="flex h-[560px] overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Sidebar — hidden below md; on small screens the chat takes over. */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 md:flex">
        <div className="min-h-0 flex-1">
          <ConversationSidebar
            groups={conversations}
            activeId={activeConvo}
            onNewChat={newChat}
            onSelect={setActiveConvo}
            onRename={(id, title) =>
              setConversations((gs) =>
                gs.map((g) => ({
                  ...g,
                  conversations: g.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
                })),
              )
            }
            onTogglePin={(id) =>
              setConversations((gs) =>
                gs.map((g) => ({
                  ...g,
                  conversations: g.conversations.map((c) =>
                    c.id === id ? { ...c, pinned: !c.pinned } : c,
                  ),
                })),
              )
            }
            onDelete={(id) =>
              setConversations((gs) =>
                gs
                  .map((g) => ({ ...g, conversations: g.conversations.filter((c) => c.id !== id) }))
                  .filter((g) => g.conversations.length > 0),
              )
            }
            onRestore={(conv) =>
              setConversations((gs) =>
                gs.map((g, i) =>
                  i === 0 ? { ...g, conversations: [conv, ...g.conversations] } : g,
                ),
              )
            }
          />
        </div>
        <div className="border-t border-zinc-200 p-3 text-xs text-zinc-500 dark:text-zinc-400 dark:border-zinc-800">
          <div className="mb-1 font-medium text-zinc-500 dark:text-zinc-400">Claude Sonnet 5</div>
          <div className="flex items-center gap-1">
            <SearchIcon />
            Search &amp; web browsing enabled
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">AI Chat</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{activeTitle}</p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            Online
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          <ResponseVersions versions={greetingVersions} onRegenerate={regenerateGreeting} />
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
              </div>
            ),
          )}

          {pending && (
            <StreamingMessage
              text={pending}
              isStreaming
              speed={2}
              onStop={() => setPending(null)}
              onComplete={onStreamComplete}
            />
          )}

          {showSources && !pending && (
            <div className="pl-11">
              <CitationList citations={SOURCES} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <ContextPicker
            className="mb-2"
            items={CONTEXT_SOURCES.map((it) =>
              contextGranted.includes(it.id) && it.status === "permission-required"
                ? { ...it, status: "available" as const }
                : it,
            )}
            selectedIds={contextSel}
            onSelectionChange={setContextSel}
            onRequestAccess={(item) => setContextGranted((g) => [...g, item.id])}
          />
          <PromptInput
            models={MODELS}
            defaultModel="sonnet"
            placeholder="Ask anything…"
            showWebSearch
            onSubmit={submit}
          />
          <p className="mt-1.5 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
