"use client";

import * as React from "react";
import { StreamingMessage } from "@/showcase/streaming-message/streaming-message";
import { PromptInput } from "@/showcase/prompt-input/prompt-input";
import { Reasoning } from "@/showcase/reasoning/reasoning";
import { ToolCall } from "@/showcase/tool-call/tool-call";
import { CitationList, type Citation } from "@/showcase/citation-ui/citation-ui";
import type { MockupConfig } from "./types";
import { DEVICE_WIDTHS } from "./types";

/* ------------------------------------------------------------------ */
/* Sample content for the AI elements                                   */
/* ------------------------------------------------------------------ */

const REASONING_STEPS = [
  {
    title: "Parsing the user's intent",
    detail: "Extracting the core question and any implicit constraints.",
  },
  {
    title: "Searching relevant sources",
    detail: "Cross-checking the claim against recent references.",
  },
  {
    title: "Structuring the answer",
    detail: "Grouping the reply into clear, skimmable sections.",
  },
];

const TOOL_CALL = {
  name: "search_web",
  input: '{\n  "query": "AI chat UI design patterns"\n}',
  output: '{\n  "results": 8,\n  "top": ["streaming message UX", "agent status UI"]\n}',
};

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
  {
    id: 3,
    title: "Streaming UX in chat products",
    url: "https://example.com/streaming-ux",
    domain: "example.com",
    snippet: "Why first-token latency beats total latency.",
  },
];

const SAMPLE_ATTACHMENTS = [
  { id: "a1", name: "requirements.pdf", size: "1.2 MB", type: "file" as const },
  { id: "a2", name: "mockup.png", size: "340 KB", type: "image" as const },
];

/* ------------------------------------------------------------------ */
/* MockupPreview                                                       */
/* ------------------------------------------------------------------ */

export function MockupPreview({ config }: { config: MockupConfig }) {
  const lastAssistantId = [...config.messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <div className={config.theme === "dark" ? "dark" : undefined}>
      <div
        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        style={{ width: DEVICE_WIDTHS[config.device], maxWidth: "100%" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {config.title}
            </p>
            {config.subtitle && (
              <p className="truncate text-xs text-zinc-400">{config.subtitle}</p>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            {config.modelName}
          </span>
        </div>

        {/* Messages */}
        <div className="space-y-5 px-4 py-5 sm:px-6">
          {config.messages.map((msg) => {
            const isStreaming =
              config.streaming && msg.role === "assistant" && msg.id === lastAssistantId;
            return msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-zinc-900 px-4 py-3 text-[15px] leading-6 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="space-y-3">
                {msg.reasoning && (
                  <Reasoning
                    steps={REASONING_STEPS}
                    elapsed="2.4s"
                    defaultOpen={false}
                  />
                )}
                {msg.tools && (
                  <ToolCall
                    name={TOOL_CALL.name}
                    input={TOOL_CALL.input}
                    output={TOOL_CALL.output}
                    status="success"
                    duration="1.8s"
                    defaultOpen={false}
                  />
                )}
                <StreamingMessage
                  text={msg.text}
                  isStreaming={isStreaming}
                  speed={2}
                  showActions={false}
                  avatar={
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {config.avatarLabel.slice(0, 2).toUpperCase()}
                    </div>
                  }
                />
                {msg.sources && (
                  <div className="pl-11">
                    <CitationList citations={SOURCES} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Composer */}
        {config.showComposer && (
          <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <PromptInput
              placeholder={config.composerPlaceholder}
              models={[{ id: config.modelName, name: config.modelName }]}
              defaultModel={config.modelName}
              attachments={config.showAttachments ? SAMPLE_ATTACHMENTS : []}
              showWebSearch={config.showSearch}
              showTools={config.showTools}
            />
            <p className="mt-1.5 text-center text-[11px] text-zinc-400">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
