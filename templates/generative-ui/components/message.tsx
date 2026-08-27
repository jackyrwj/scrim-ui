"use client";

import * as React from "react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import { askChoice, type AskChoiceInput } from "@/lib/widgets";
import { renderSkeleton, renderWidget } from "./widgets/registry";
import { AskChoice } from "./widgets/ask-choice";
import { GenerativeUi } from "./ui/generative-ui";

/**
 * One message, rendered part by part.
 *
 * `parts` is an ORDERED list, not a bag of fields. A turn can be: a sentence,
 * then a widget, then the rest of the sentence. Rendering "the text" and "the
 * widgets" as two blocks silently reorders what the model did.
 *
 * The tool parts are handled by **name lookup, not a switch**. A switch
 * statement per widget is the version in every tutorial, and it means the set
 * of things that can render lives in a component — three files away from the
 * registry that is supposed to be the boundary. Here the name goes to the
 * registry and the registry answers, including with "no".
 *
 * The four tool states worth distinguishing:
 *
 *   input-streaming  → the model has decided what to show, not yet what about
 *   input-available  → tool is running; skeleton, now with a title
 *   output-available → validate, then draw
 *   output-error     → say so, in prose
 */

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function Message({
  message,
  streaming,
  onAction,
  onChoice,
}: {
  message: UIMessage;
  streaming: boolean;
  /** A widget sending a message on the user's behalf. */
  onAction: (text: string) => void;
  /** A client-side tool answering with a tool result. */
  onChoice: (toolCallId: string, choice: { id: string; label: string }) => void;
}) {
  if (message.role === "user") {
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
    <div className="space-y-3">
      {message.parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <p key={i} className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-800 dark:text-zinc-200">
              {part.text}
              {streaming && part.state !== "done" && (
                <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
              )}
            </p>
          );
        }

        if (!isToolUIPart(part)) return null;

        const name = getToolName(part);

        /* The one tool the browser answers. Kept apart from the registry
           because it is a different kind of thing: the others render data,
           this one collects it. */
        if (name === askChoice.name) {
          const input = part.input as Partial<AskChoiceInput> | undefined;
          const answered =
            part.state === "output-available" ? (part.output as { label?: string } | undefined)?.label : undefined;

          if (!input?.question || !Array.isArray(input.options)) {
            return part.state === "output-error" ? (
              <Unsupported key={i} tool={name} reason={part.errorText} />
            ) : null;
          }

          return (
            <GenerativeUi key={i} tool={name} state="ready">
              <AskChoice
                question={input.question}
                options={input.options.filter((option) => option?.id && option.label) as AskChoiceInput["options"]}
                answered={answered}
                onChoose={(choice) => onChoice(part.toolCallId, choice)}
              />
            </GenerativeUi>
          );
        }

        if (part.state === "input-streaming" || part.state === "input-available") {
          const result = renderSkeleton(name, part.input);
          if (result.kind === "unsupported") return null;
          return (
            <GenerativeUi key={i} tool={name} state="streaming" skeleton={result.node} />
          );
        }

        if (part.state === "output-available") {
          const result = renderWidget(name, part.output, onAction);
          if (result.kind === "unsupported") {
            return <Unsupported key={i} tool={name} reason={result.reason} data={formatValue(part.output)} />;
          }
          return (
            <GenerativeUi key={i} tool={name} state="ready" data={formatValue(part.output)}>
              {result.node}
            </GenerativeUi>
          );
        }

        if (part.state === "output-error") {
          return <Unsupported key={i} tool={name} reason={part.errorText} />;
        }

        return null;
      })}
    </div>
  );
}

/**
 * The fallback.
 *
 * Prose, and the raw data behind a toggle. A model that produced a usable
 * answer should not have it thrown away because the client cannot draw it —
 * which is the case whenever a browser is one deploy behind the server, and
 * that is most browsers most of the time.
 */
function Unsupported({ tool, reason, data }: { tool: string; reason?: string; data?: string }) {
  return (
    <GenerativeUi
      tool={tool}
      state="unsupported"
      data={data}
      fallback={reason ?? `This app cannot display the ${tool} result yet.`}
    />
  );
}
