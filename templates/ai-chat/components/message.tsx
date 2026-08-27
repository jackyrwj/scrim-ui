"use client";

import * as React from "react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import { ToolCall, type ToolStatus } from "./ui/tool-call";
import { Reasoning } from "./ui/reasoning";
import { MessageActions } from "./ui/message-actions";

/**
 * One message, rendered part by part.
 *
 * The important idea — and the one every hand-rolled chat UI gets wrong the
 * first time — is that `parts` is an ORDERED list, not a bag of fields. A
 * turn can be: reasoning, then a tool call, then a sentence, then a second
 * tool call, then the rest of the sentence. Rendering "the text" and "the
 * tools" as two separate blocks reorders what the model actually did.
 *
 * So this maps over parts in sequence and switches on the type, which is also
 * why the components below are dumb: each one renders a part, and the order
 * comes from the model.
 */

function toolStatus(state: string): ToolStatus {
  if (state === "output-available") return "success";
  if (state === "output-error") return "error";
  return "running";
}

/** Tool output as something a person can read, without a JSON viewer. */
function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function Message({
  message,
  streaming,
  onRegenerate,
}: {
  message: UIMessage;
  /** True only for the last assistant message while the stream is open. */
  streaming: boolean;
  onRegenerate: () => void;
}) {
  const isUser = message.role === "user";

  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("");

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-4 py-2.5 text-[15px] leading-6 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
          {message.parts.map((part, i) =>
            part.type === "text" ? (
              <p key={i} className="whitespace-pre-wrap">
                {part.text}
              </p>
            ) : null,
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group space-y-3">
      {message.parts.map((part, i) => {
        if (part.type === "reasoning") {
          return (
            <Reasoning
              key={i}
              steps={[{ title: "Thinking", detail: part.text }]}
              isThinking={streaming && part.state !== "done"}
            />
          );
        }

        if (part.type === "text") {
          return (
            <p key={i} className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-800 dark:text-zinc-200">
              {part.text}
              {/* The caret belongs on the part that is still streaming, not
                  at the end of the message — a tool call after the text
                  would otherwise sit below a blinking cursor. */}
              {streaming && part.state !== "done" && (
                <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
              )}
            </p>
          );
        }

        if (isToolUIPart(part)) {
          return (
            <ToolCall
              key={i}
              name={getToolName(part)}
              status={toolStatus(part.state)}
              input={formatValue(part.input)}
              output={
                part.state === "output-error"
                  ? part.errorText
                  : part.state === "output-available"
                    ? formatValue(part.output)
                    : undefined
              }
            />
          );
        }

        return null;
      })}

      {/* Actions appear once the turn is finished. Copying half a streamed
          sentence is never what anyone wanted. */}
      {!streaming && text.length > 0 && (
        <MessageActions
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
          onCopy={() => navigator.clipboard.writeText(text)}
          onRegenerate={onRegenerate}
        />
      )}
    </div>
  );
}
