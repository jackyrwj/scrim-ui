"use client";

import { MarkdownMessage } from "./markdown-message";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/* The same three bodies the old variants used, so nothing the page said about
   this component stopped being true when it became editable. */
const DEFAULT_TEXT = `Here’s a quick comparison of the three approaches:

1. **Streaming** — the answer starts appearing while the model is still writing it. Best when reading time roughly equals generation time.
2. **Waiting** — the model finishes, then the UI renders. Best for structured output that must be valid before it’s shown.
3. **Hybrid** — stream the prose, gate anything the user will copy or act on until it’s done.

See [the streaming guide](/inspiration/streaming-vs-full-reply) for the full decision rule.`;

const CODE_TEXT = `The copy button is wired to the \\\`clipboard\\\` API, so this whole block can be lifted into any React app as-is:

\\\`\\\`\\\`tsx
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" onClick={copy}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
\\\`\\\`\\\`

Rendering code as *real tokens* instead of a string means highlighting can break mid-stream — render plain text while streaming, then swap in the highlighted version when the message completes.`;

const TABLE_TEXT = `State changes happen at the edges of generation, not inside it:

| Phase | What renders | Streaming? |
| --- | --- | --- |
| First token | Caret + partial text | Yes |
| Tool call | Status row + inputs | Yes |
| Final answer | Cited, validated prose | On completion |
| Structured output | Parsed object, copyable | On completion |

Long tables scroll horizontally inside their own container instead of stretching the message column.`;

export const markdownMessageControls: ComponentControls = {
  tag: "MarkdownMessage",
  importFrom: "./markdown-message",
  controls: [
    { kind: "text", name: "text", label: "Markdown", value: DEFAULT_TEXT, multiline: true },
  ],
  presets: [
    {
      id: "default",
      title: "Prose",
      note: "Bold, links and a numbered list — the everyday reply.",
      values: { text: DEFAULT_TEXT },
    },
    {
      id: "code-block",
      title: "Code block",
      note: "Fenced code renders as a labelled, copyable block.",
      values: { text: CODE_TEXT },
    },
    {
      id: "table",
      title: "Table",
      note: "Pipe tables get a header row and scroll inside their own container.",
      values: { text: TABLE_TEXT },
    },
  ],
};

export function renderMarkdownMessage(v: ControlValues, key: string) {
  return <MarkdownMessage key={key} text={String(v.text)} />;
}
