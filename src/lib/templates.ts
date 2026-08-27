import type { Tier } from "./pro";

/**
 * Templates — complete applications, as opposed to components.
 *
 * The distinction is the whole pricing argument. A component is a file you
 * paste; a template is the twenty decisions around it that nobody enjoys
 * making twice: which parts array to render in what order, what `status`
 * means for the composer, where the model id is validated, what happens when
 * the provider rate-limits you mid-stream.
 *
 * Metadata only. Paid files live in the private Pro repository. Its artifact
 * build publishes a metadata-only catalog for this site and protected source
 * payloads for entitled buyers.
 */

export type TemplateEntry = {
  name: string;
  slug: string;
  /** The SERP headline; falls back to the generic pattern. Under ~48 chars. */
  searchTitle?: string;
  description: string;
  /** Directory under templates/ holding the application. */
  dir: string;
  stack: string[];
  /** Scrim UI component slugs the template ships with, for cross-linking. */
  componentSlugs: string[];
  tier: Tier;
  status: "published" | "planned";
};

export const templates: TemplateEntry[] = [
  {
    name: "AI Chat",
    slug: "ai-chat",
    searchTitle: "Next.js AI Chatbot Template — AI SDK",
    description:
      "A complete Next.js chat app on the AI SDK — streaming, tool calls, reasoning, model switching, saved conversations and real error states.",
    dir: "ai-chat",
    stack: ["Next.js 16", "React 19", "AI SDK 7", "Tailwind v4", "TypeScript"],
    componentSlugs: ["prompt-input", "tool-call", "reasoning", "error-message", "thinking-indicator", "message-actions"],
    tier: "pro",
    status: "published",
  },
  {
    name: "RAG Document Q&A",
    slug: "rag-qa",
    searchTitle: "Next.js RAG Template with Citations",
    description:
      "Upload, chunk, embed, retrieve, answer — with citations that land on the sentence they came from, not a list of filenames at the bottom.",
    dir: "rag-qa",
    stack: ["Next.js 16", "React 19", "AI SDK 7", "Tailwind v4", "TypeScript"],
    /* Three of the six the chat template uses. The rest of this app's UI is
       its own — a citation chip, a reading pane with highlights, a chunking
       panel — because none of it exists as a free component yet. */
    componentSlugs: ["prompt-input", "error-message", "thinking-indicator"],
    tier: "pro",
    status: "published",
  },
  {
    name: "Agent Run Console",
    slug: "agent-console",
    searchTitle: "Next.js AI Agent Console Template",
    description:
      "A resumable agent run: human-in-the-loop approvals, per-step cost and tokens, retry and step-level re-run, and cancellation that actually stops the model.",
    dir: "agent-console",
    stack: ["Next.js 16", "React 19", "AI SDK 7", "Tailwind v4", "TypeScript"],
    /* The run lives in a server-side event log, so the UI is a projection of
       it — the components below render steps, not state they own. */
    componentSlugs: ["agent-status", "approval-request", "tool-call", "error-message"],
    tier: "pro",
    status: "published",
  },
  {
    name: "Structured Extraction",
    slug: "structured-extraction",
    searchTitle: "Streaming Structured Output Template",
    description:
      "Stream a zod schema into a form: partial objects rendered without flicker or layout shift, per-field confidence and evidence, correction, and honest validation failure.",
    dir: "structured-extraction",
    stack: ["Next.js 16", "React 19", "AI SDK 7", "zod 4", "Tailwind v4", "TypeScript"],
    /* Almost all of this app's UI is schema-derived and specific to it — a
       confidence dot, a settling number, an evidence line. */
    componentSlugs: ["error-message"],
    tier: "pro",
    status: "published",
  },
  {
    name: "Generative UI",
    slug: "generative-ui",
    searchTitle: "Next.js Generative UI Template — AI SDK",
    description:
      "A chat where the model renders components: a two-sided registry as the trust boundary, streaming props, skeletons from partial input, and prose when a name is unknown.",
    dir: "generative-ui",
    stack: ["Next.js 16", "React 19", "AI SDK 7", "zod 4", "Tailwind v4", "TypeScript"],
    componentSlugs: ["generative-ui", "prompt-input", "error-message", "thinking-indicator"],
    tier: "pro",
    status: "published",
  },
];

export const publishedTemplates = templates.filter((t) => t.status === "published");

export function getTemplate(slug: string) {
  return templates.find((t) => t.slug === slug);
}
