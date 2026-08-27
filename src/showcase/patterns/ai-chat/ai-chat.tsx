"use client";

import * as React from "react";
import { PromptInput } from "../../prompt-input/prompt-input";
import { StreamingMessage } from "../../streaming-message/streaming-message";
import { CitationList, type Citation } from "../../citation-ui/citation-ui";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Turn = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const MODELS = [
  { id: "sonnet", name: "Claude Sonnet 5", hint: "Balanced", icon: <ClaudeMark /> },
  { id: "opus", name: "Claude Opus 5", hint: "Reasoning", icon: <ClaudeMark /> },
  { id: "haiku", name: "Claude Haiku 4.5", hint: "Fast", icon: <ClaudeMark /> },
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="M12 5v14M5 12h14" />
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
  const [turns, setTurns] = React.useState<Turn[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi — I'm your AI research assistant. Ask me anything, or attach files and I'll ground answers in them.",
    },
  ]);
  const [pending, setPending] = React.useState<string | null>(null);
  const [showSources, setShowSources] = React.useState(false);
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

  return (
    <div className="flex h-[560px] overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/40 md:flex">
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              setTurns([
                { id: idRef.current++, role: "assistant", text: "New conversation started. What are you working on?" },
              ]);
              setPending(null);
              setShowSources(false);
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <PlusIcon />
            New chat
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {["Streaming UI patterns", "Claude model pricing", "Agent approval UX", "Research: RAG citations"].map(
            (title, i) => (
              <button
                key={title}
                type="button"
                className={`w-full truncate rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                  i === 0
                    ? "bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
                }`}
              >
                {title}
              </button>
            ),
          )}
        </nav>
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
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">AI Chat</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Streaming UI patterns</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            Online
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
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
