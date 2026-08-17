"use client";

import * as React from "react";
import { MessageActions } from "./message-actions";

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
        AI
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">Assistant</div>
        <div className="mt-1.5 rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-[15px] leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DemoDefault() {
  return (
    <div>
      <AssistantBubble>
        A research assistant runs a search, reads four sources, then writes a cited answer. Each of those steps is a UI state a message can pass through.
      </AssistantBubble>
      <MessageActions
        className="mt-2 pl-11"
        onCopy={() => {}}
        onRegenerate={() => {}}
        onShare={() => {}}
        onFeedback={() => {}}
      />
    </div>
  );
}

export function DemoStreaming() {
  return (
    <div>
      <AssistantBubble>
        Writing the answer now, then I’ll pull the sources…
      </AssistantBubble>
      <MessageActions className="mt-2 pl-11" disabled onCopy={() => {}} onRegenerate={() => {}} onFeedback={() => {}} />
    </div>
  );
}

export function DemoCompact() {
  return (
    <div>
      <AssistantBubble>
        Done — here’s the full breakdown with citations.
      </AssistantBubble>
      <MessageActions className="mt-2 pl-11" compact onCopy={() => {}} onRegenerate={() => {}} onShare={() => {}} onFeedback={() => {}} />
    </div>
  );
}
