"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DEFAULT_MODEL, MODELS } from "@/lib/models";
import {
  deleteConversation,
  getConversation,
  newConversationId,
  saveConversation,
  useConversations,
} from "@/lib/storage";
import { Message } from "./message";
import { PromptInput } from "./ui/prompt-input";
import { ErrorMessage } from "./ui/error-message";
import { ThinkingIndicator } from "./ui/thinking-indicator";

/**
 * The whole chat: history sidebar, transcript, composer.
 *
 * `status` from useChat drives almost everything visible here. Its four
 * values map to four different screens, and collapsing them into one boolean
 * "loading" is what makes a chat feel broken:
 *
 *   submitted → request sent, nothing back yet   → thinking indicator
 *   streaming → tokens arriving                  → caret, Stop button
 *   ready     → done                             → composer enabled
 *   error     → request failed                   → error with Retry
 */
export function Chat() {
  const conversations = useConversations();
  const [conversationId, setConversationId] = React.useState(newConversationId);
  const [model, setModel] = React.useState(DEFAULT_MODEL);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { messages, setMessages, sendMessage, status, stop, error, regenerate } = useChat();

  const busy = status === "submitted" || status === "streaming";

  /* Persist after every settled turn. Writing mid-stream would store a
     half-finished message and rewrite the same row on every token. */
  React.useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      saveConversation(conversationId, messages);
    }
  }, [status, messages, conversationId]);

  /* Follow the stream, but only from the bottom: a reader who has scrolled up
     to re-read something is not asking to be dragged back down. */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function startNewChat() {
    stop();
    setConversationId(newConversationId());
    setMessages([]);
  }

  function openConversation(id: string) {
    const conversation = getConversation(id);
    if (!conversation) return;
    stop();
    setConversationId(id);
    setMessages(conversation.messages);
  }

  function submit(text: string, selected?: string) {
    const chosen = selected ?? model;
    setModel(chosen);
    /* The model id travels in the request body, per message rather than per
       hook, so switching models mid-conversation applies to the next turn
       without tearing down the chat. The server re-checks it. */
    sendMessage({ text }, { body: { model: chosen } });
  }

  return (
    <div className="flex h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 p-3 md:flex dark:border-zinc-800">
        <button
          type="button"
          onClick={startNewChat}
          className="mb-3 flex h-9 items-center justify-center rounded-lg border border-zinc-200 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          New chat
        </button>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="px-2 py-4 text-xs text-zinc-500">Conversations you start appear here.</p>
          )}
          {conversations.map((c) => (
            <div key={c.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => openConversation(c.id)}
                className={`min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                  c.id === conversationId ? "bg-zinc-100 font-medium dark:bg-zinc-900" : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {c.title}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConversation(c.id);
                  if (c.id === conversationId) startNewChat();
                }}
                aria-label={`Delete ${c.title}`}
                className="shrink-0 rounded-md p-1 text-zinc-400 opacity-0 transition-opacity hover:text-zinc-900 group-hover:opacity-100 focus:opacity-100 dark:hover:text-zinc-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Transcript + composer */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            {messages.length === 0 && (
              <div className="pt-24 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">What can I help with?</h1>
                <p className="mt-2 text-sm text-zinc-500">
                  Ask anything, or try &ldquo;what&rsquo;s the weather in Shenzhen?&rdquo; to see a tool call.
                </p>
              </div>
            )}

            {messages.map((message, i) => (
              <Message
                key={message.id}
                message={message}
                streaming={status === "streaming" && i === messages.length - 1 && message.role === "assistant"}
                onRegenerate={() => regenerate({ body: { model } })}
              />
            ))}

            {/* Only before the first token — once text is arriving, the
                caret in the message is the progress indicator. */}
            {status === "submitted" && <ThinkingIndicator />}

            {error && (
              <ErrorMessage
                message={error.message || "Something went wrong. Try again."}
                onRetry={() => regenerate({ body: { model } })}
              />
            )}
          </div>
        </div>

        <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <div className="mx-auto max-w-3xl">
            <PromptInput
              models={MODELS.map((m) => ({ id: m.id, name: m.name, hint: m.hint }))}
              defaultModel={DEFAULT_MODEL}
              loading={busy}
              onSubmit={submit}
              onStop={stop}
            />
            <p className="mt-2 text-center text-[11px] text-zinc-400">
              Models make mistakes. Check anything that matters.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
