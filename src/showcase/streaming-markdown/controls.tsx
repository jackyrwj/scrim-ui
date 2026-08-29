"use client";

import { StreamingMarkdown } from "./streaming-markdown";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/* Every preset is a snapshot of text mid-token — the states a finished
   message never contains and every streamed one passes through. Turn
   `streaming` off on any of them to see what the same text renders as once
   speculation is switched off: unmatched delimiters become the literal
   characters they are. */

const MID_BOLD = `The right answer depends on **what you are optim`;

const MID_CODE = `Call it with \`streaming={status === "strea`;

const MID_LINK = `Full reasoning is in [the streaming guide](/inspir`;

const MID_TABLE = `| Construct | Ambiguous until |
| --- | --- |
| Bold | closing \`**\` |
| Link | closing`;

const MID_FENCE = `Drop it in where the message body renders:

\`\`\`tsx
<StreamingMarkdown
  text={text}
  streaming={status === "strea`;

const COMPLETE = `Streaming markdown is **harder than it looks**.

While \`inline code\` is arriving, the opening backtick has landed but the closing one has not — so a naive renderer shows the raw character, then removes it.

See [the streaming guide](/inspiration/streaming-vs-full-reply) for the decision rule.`;

export const streamingMarkdownControls: ComponentControls = {
  tag: "StreamingMarkdown",
  importFrom: "./streaming-markdown",
  controls: [
    { kind: "text", name: "text", label: "Markdown", value: MID_BOLD, multiline: true },
    { kind: "boolean", name: "streaming", label: "Streaming", value: true },
  ],
  presets: [
    {
      id: "mid-bold",
      title: "Unclosed bold",
      note: "`**what you are optim` — already bold, asterisks hidden. Closing it changes nothing.",
      values: { text: MID_BOLD, streaming: true },
    },
    {
      id: "mid-code",
      title: "Unclosed code span",
      note: "One backtick in. Rendered as code immediately rather than as a stray character.",
      values: { text: MID_CODE, streaming: true },
    },
    {
      id: "mid-link",
      title: "Link with no href",
      note: "The label is styled as a link while the URL is still arriving — nothing moves when it lands.",
      values: { text: MID_LINK, streaming: true },
    },
    {
      id: "mid-table",
      title: "Table still filling",
      note: "Rows are padded to the header width, so the column count never changes underneath you.",
      values: { text: MID_TABLE, streaming: true },
    },
    {
      id: "mid-fence",
      title: "Unclosed code fence",
      note: "A code block from the first line, not a paragraph of backticks that becomes one later.",
      values: { text: MID_FENCE, streaming: true },
    },
    {
      id: "settled",
      title: "Turn streaming off",
      note: "Speculation is only valid while text is coming. Finished text is parsed strictly.",
      values: { text: COMPLETE, streaming: false },
    },
  ],
};

export function renderStreamingMarkdown(v: ControlValues, key: string) {
  return <StreamingMarkdown key={key} text={String(v.text)} streaming={Boolean(v.streaming)} />;
}
