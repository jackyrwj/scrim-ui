"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { DEFAULT_MODEL, MODELS } from "@/lib/models";
import { askChoice } from "@/lib/widgets";
import { Message } from "./message";
import { PromptInput } from "./ui/prompt-input";
import { ErrorMessage } from "./ui/error-message";
import { ThinkingIndicator } from "./ui/thinking-indicator";

const EXAMPLES = [
  "What's the weather in Lisbon and in Reykjavik?",
  "Find me a flight from SFO to Tokyo on 3 May",
  "Chart our signups: Jan 1200, Feb 1580, Mar 1420, Apr 2100, May 2650",
  "I need to book travel — help me narrow it down",
];

/**
 * The conversation.
 *
 * Two things here are specific to generative UI rather than to chat.
 *
 * **`sendAutomaticallyWhen`.** The `askChoice` tool has no `execute` on the
 * server, so the turn ends with a tool call and no result — the model is
 * waiting on the browser. When the click supplies that result the request has
 * to go back out, and without this the conversation simply stops: the user
 * answered a question and nothing happened. `lastAssistantMessageIsComplete-
 * WithToolCalls` fires only once *every* client-side call has an output, so a
 * message carrying two questions waits for both answers.
 *
 * **Widget actions are messages.** A button inside a rendered widget calls
 * `sendMessage` with plain text, so the model sees what it would have seen
 * had the user typed it. The alternative — a side channel that mutates app
 * state without telling the model — produces a conversation where the next
 * sentence contradicts what is on screen.
 */
export function Chat() {
  const [model, setModel] = React.useState(DEFAULT_MODEL);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { messages, sendMessage, addToolOutput, status, stop, error, regenerate } = useChat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const busy = status === "submitted" || status === "streaming";

  /* Follow the stream, but only from the bottom — a reader who scrolled up to
     look at a chart is not asking to be dragged back down. */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function submit(text: string, selected?: string) {
    const chosen = selected ?? model;
    setModel(chosen);
    /* The id travels per message, not per hook, so switching models mid-
       conversation applies from the next turn without tearing down the chat.
       The server re-checks it against the allowlist. */
    sendMessage({ text }, { body: { model: chosen } });
  }

  return (
    <div className="flex h-dvh flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex h-14 shrink-0 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-2xl items-baseline gap-2.5">
          <h1 className="text-sm font-semibold">Generative UI</h1>
          <p className="hidden text-xs text-zinc-500 sm:block">
            The model picks the component. The registry decides whether it exists.
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-6">
          {messages.length === 0 ? (
            <Empty onPick={(text) => submit(text)} />
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <Message
                  key={message.id}
                  message={message}
                  streaming={status === "streaming" && index === messages.length - 1}
                  onAction={(text) => submit(text)}
                  onChoice={(toolCallId, choice) =>
                    addToolOutput({ tool: askChoice.name, toolCallId, output: choice })
                  }
                />
              ))}

              {status === "submitted" && <ThinkingIndicator variant="dots" />}

              {error && (
                <ErrorMessage
                  message={error.message || "The request failed."}
                  onRetry={() => regenerate()}
                  retrying={busy}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="mx-auto w-full max-w-2xl">
          <PromptInput
            placeholder="Ask for weather, flights, or a chart…"
            models={MODELS}
            defaultModel={DEFAULT_MODEL}
            onSubmit={submit}
            onStop={stop}
            loading={busy}
          />
        </div>
      </div>
    </div>
  );
}

function Empty({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="pt-14 text-center">
      <h2 className="text-lg font-semibold">Three widgets and a question</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-zinc-500">
        The model may render weather, flights, or a chart — nothing else. Ask for
        anything outside that set and it answers in prose, which is the point.
      </p>
      <div className="mx-auto mt-6 grid max-w-md gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onPick(example)}
            className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-left text-[13px] text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
