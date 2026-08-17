import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoCodeBlock, DemoTable } from "./demos";

export const markdownMessagePageConfig: ComponentPageConfig = {
  sourceFile: "markdown-message.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Default",
      note: "A rendered reply with bold, links, a numbered list and a call-out to the streaming guide — the standard chat body.",
      demo: <DemoDefault />,
    },
    {
      id: "code-block",
      title: "Code block",
      note: "Fenced code renders as a labeled, copyable block. The note in the demo shows why code should render only after streaming completes.",
      demo: <DemoCodeBlock />,
    },
    {
      id: "table",
      title: "Table",
      note: "Pipe tables render with a header row and scrolled overflow so wide tables never stretch the message.",
      demo: <DemoTable />,
    },
  ],
  usage: [
    "Render markdown as React nodes, never `dangerouslySetInnerHTML` — your model output is untrusted text from a remote model.",
    "Render plain text while streaming, then upgrade to rendered markdown when the turn completes; highlighting breaks mid-token.",
    "Give code blocks a language label and a copy button — users copy code far more than they copy prose.",
    "Let wide tables scroll inside their own container; never let a table stretch the message column.",
  ],
  mistakes: [
    "Attempting to render markdown token-by-token during streaming — bold and code spans are ambiguous until the token is complete.",
    "Using an HTML-string renderer on model output without sanitizing links and HTML.",
    "Hiding the raw text entirely; a 'view source' affordance on messages with heavy formatting builds trust.",
  ],
};
