"use client";

import * as React from "react";
import { MessageActions } from "./message-actions";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/* The bubble is context for the preview only — it is not part of the
   component, so it stays out of the generated snippet. */
function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
        AI
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">Assistant</div>
        <div className="mt-1.5 rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-[15px] leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100">
          A research assistant runs a search, reads four sources, then writes a cited answer.
          Each of those steps is a UI state a message can pass through.
        </div>
        {children}
      </div>
    </div>
  );
}

export const messageActionsControls: ComponentControls = {
  tag: "MessageActions",
  importFrom: "./message-actions",
  controls: [
    { kind: "boolean", name: "compact", label: "Compact (icon only)", value: false },
    { kind: "boolean", name: "disabled", label: "Disabled (while streaming)", value: false },
  ],
  handlers: ["onCopy", "onRegenerate", "onShare", "onFeedback"],
  presets: [
    {
      id: "default",
      title: "Default",
      note: "Labelled actions under a finished message.",
      values: { compact: false, disabled: false },
    },
    {
      id: "streaming",
      title: "While streaming",
      note: "Dimmed and inert until the answer is complete — copying half a reply helps nobody.",
      values: { compact: false, disabled: true },
    },
    {
      id: "compact",
      title: "Compact",
      note: "Icon-only for dense transcripts. Each button keeps an accessible name.",
      values: { compact: true, disabled: false },
    },
  ],
};

export function renderMessageActions(v: ControlValues, key: string) {
  return (
    <AssistantBubble>
      <MessageActions
        key={key}
        className="mt-2"
        compact={Boolean(v.compact)}
        disabled={Boolean(v.disabled)}
        onCopy={() => {}}
        onRegenerate={() => {}}
        onShare={() => {}}
        onFeedback={() => {}}
      />
    </AssistantBubble>
  );
}
