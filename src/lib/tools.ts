/* ------------------------------------------------------------------ */
/* The single source of truth for first-party /tools pages.            */
/* Read by the /tools index, the homepage, header search and sitemap — */
/* add a tool here once and it shows up everywhere.                    */
/* ------------------------------------------------------------------ */

export type Tool = {
  slug: string;
  name: string;
  /** Shorter label for the compact homepage cards. Defaults to `name`. */
  shortName?: string;
  /** Full description, used on the /tools index and the homepage. */
  description: string;
  /** One line, used in the header search results. */
  searchDescription: string;
  /** Call to action on the homepage card. */
  cta?: string;
  status: "published" | "planned";
  /** Surfaced on the homepage, newest first. */
  featured?: boolean;
  /** Shows a "New" pill and the accent border on the homepage. */
  isNew?: boolean;
};

export const tools: Tool[] = [
  {
    slug: "model-switcher",
    name: "Model Switcher Builder",
    description:
      "Design the control people use to pick a model — dropdown, segmented, pills or command list — and copy a dependency-free React component.",
    searchDescription: "Design a custom AI model switcher and copy the React component",
    cta: "Open tool",
    status: "published",
    featured: true,
    isNew: true,
  },
  {
    slug: "chat-mockup",
    name: "AI Chat Mockup Generator",
    description:
      "Compose a realistic AI chat screen — streaming, reasoning, tool calls, citations — and export it as a PNG for your landing page or deck.",
    searchDescription: "Compose a realistic AI chat screen and export as PNG",
    cta: "Open tool",
    status: "published",
    featured: true,
  },
  {
    slug: "theme-generator",
    name: "AI Chat Theme Generator",
    description:
      "Pick a brand color and generate a complete AI chat interface color scheme with live preview. Export as CSS variables or Tailwind config.",
    searchDescription: "Generate a full AI chat color scheme from one brand color",
    cta: "Open tool",
    status: "published",
    featured: true,
  },
  {
    slug: "token-counter",
    name: "Prompt Token Counter",
    description:
      "Paste text and see estimated token counts and API costs for GPT-4o, Claude, Gemini and more. All counting runs locally.",
    searchDescription: "Estimated token counts and API costs for GPT, Claude and Gemini",
    status: "published",
  },
  {
    slug: "screenshot-mockup",
    name: "Screenshot Device Mockup",
    description:
      "Upload a screenshot and place it in iPhone, MacBook, iPad or browser device frames. Export a polished mockup PNG.",
    searchDescription: "Place a screenshot in an iPhone, MacBook, iPad or browser frame",
    status: "published",
  },
  {
    slug: "flow-diagram",
    name: "AI Conversation Flow Diagram",
    description:
      "Build visual conversation flows with user messages, AI responses, tool calls and approval gates. Export as SVG or PNG.",
    searchDescription: "Build and export conversation flow diagrams as SVG or PNG",
    status: "published",
  },
  {
    slug: "voice-mockup",
    name: "Voice Assistant Mockup Generator",
    description:
      "Compose a realistic voice assistant screen — listening, thinking, speaking, interrupted — and export it as a PNG for your landing page or deck.",
    searchDescription: "Compose a realistic voice assistant screen and export as PNG",
    status: "published",
  },
  {
    slug: "voice-scripts",
    name: "Voice Conversation Script Library",
    shortName: "Voice Conversation Scripts",
    description:
      "Ready-made voice assistant transcripts for common scenarios. Load them into the mockup generator or copy the text.",
    searchDescription: "Ready-made voice assistant transcripts for common scenarios",
    cta: "Browse scripts",
    status: "published",
  },
  {
    slug: "prompt-generator",
    name: "AI Interface Prompt Generator",
    description:
      "Describe your product and get a copy-ready prompt for generating the interface in v0, Claude or Cursor.",
    searchDescription: "Generate UI prompts for AI coding tools",
    status: "published",
  },
  {
    slug: "playground",
    name: "Component Playground",
    description:
      "Try the prompt input, streaming message and tool call components in one place — tune their states live and jump to the full component page.",
    searchDescription: "Interactive playground for all components",
    status: "published",
  },
];

export const publishedTools = tools.filter((t) => t.status === "published");

/** The three tools the homepage puts forward. */
export const featuredTools = publishedTools.filter((t) => t.featured).slice(0, 3);

export function toolHref(tool: Tool): string {
  return `/tools/${tool.slug}`;
}

export function toolLabel(tool: Tool): string {
  return tool.shortName ?? tool.name;
}
