import type { Tier } from "./pro";

export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type ComponentEntry = {
  name: string;
  slug: string;
  category: string;
  /** The SERP headline. Falls back to the generic pattern when absent — see
   *  generateMetadata in app/components/[slug]/page.tsx. Kept under ~48
   *  characters because the root layout appends " — Scrim UI". */
  searchTitle?: string;
  description: string;
  frameworks: string[];
  variants: string[];
  tags: string[];
  status: "published" | "planned";
  /** Absent means "free" — the field is opt-in so the 29 published free
   *  components did not all need editing to say what they already were.
   *  A "pro" entry keeps its page public and indexable; only the source and
   *  the install command are withheld. See lib/pro.ts. */
  tier?: Tier;
};

export const categories: Category[] = [
  {
    slug: "prompt-input",
    name: "Prompt & Input",
    description: "Prompt inputs, attachments, model selectors, voice and tool controls.",
  },
  {
    slug: "messages",
    name: "Messages",
    description: "User and assistant messages, streaming, markdown, code and errors.",
  },
  {
    slug: "reasoning",
    name: "Reasoning & Progress",
    description: "Thinking indicators, reasoning steps, agent progress and task states.",
  },
  {
    slug: "tool-calls",
    name: "Tool Calls",
    description: "Search, browser, code execution and other tool call UIs.",
  },
  {
    slug: "sources",
    name: "Sources & Citations",
    description: "Inline citations, source cards, and research source panels.",
  },
  {
    slug: "agents",
    name: "Agents",
    description: "Agent status, queues, handoffs and human-in-the-loop approvals.",
  },
  {
    slug: "feedback",
    name: "Evaluation & Feedback",
    description: "Ratings, corrections, side-by-side output comparison and eval results.",
  },
  {
    slug: "files",
    name: "Files & Context",
    description: "File uploads, attachments, context and token usage.",
  },
  {
    slug: "voice",
    name: "Voice",
    description: "Voice input, waveforms, recording and conversation states.",
  },
  {
    slug: "memory",
    name: "Memory",
    description: "Saved memories, remember-this suggestions, and persistent user context.",
  },
  {
    slug: "model-settings",
    name: "Model & Settings",
    description: "Model selectors, reasoning levels, tool toggles, generation controls and spend.",
  },
];

export const components: ComponentEntry[] = [
  {
    name: "Prompt Input",
    slug: "prompt-input",
    category: "prompt-input",
    searchTitle: "AI Chat Input Box — React Component",
    description:
      "The message input at the heart of an AI chat app — file attachments, model picker, tool toggles, voice, and a send button that turns into stop.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "with-attachments", "with-model-selector", "loading", "error", "disabled"],
    tags: ["prompt", "input", "chat", "textarea", "composer"],
    status: "published",
  },
  {
    name: "Prompt Input + Attachments",
    slug: "prompt-input-attachments",
    category: "prompt-input",
    searchTitle: "Chat Input with File Upload — React",
    description:
      "A chat input that accepts file uploads — attachment chips with upload progress, type icons, and one-click removal.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "uploading", "error"],
    tags: ["prompt", "input", "attachments", "files"],
    status: "published",
  },
  {
    name: "Prompt Input + Model Selector",
    slug: "prompt-input-model-selector",
    category: "prompt-input",
    searchTitle: "Chat Input with Model Picker — React",
    description:
      "A chat input with the model picker built in — switch models inline, with badges for what each one can do.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "compact"],
    tags: ["prompt", "input", "model", "selector"],
    status: "published",
  },
  {
    name: "Streaming Message",
    slug: "streaming-message",
    category: "messages",
    searchTitle: "React Typing Effect — Streaming AI Message",
    description:
      "Render an AI reply token by token like ChatGPT's typing effect — blinking cursor, stop button, and no layout jump as the text grows.",
    frameworks: ["react", "tailwind"],
    variants: ["streaming", "complete", "stopped"],
    tags: ["message", "streaming", "assistant"],
    status: "published",
  },
  {
    name: "User Message",
    slug: "user-message",
    category: "messages",
    searchTitle: "Chat Bubble UI — React Message Component",
    description:
      "The user's chat bubble — right-aligned, with hover actions to copy, edit the prompt, or regenerate the answer.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "edited", "long"],
    tags: ["user", "message", "chat", "bubble", "edit"],
    status: "published",
  },
  {
    name: "Message Actions",
    slug: "message-actions",
    category: "messages",
    searchTitle: "Message Actions UI — Copy & Regenerate",
    description:
      "The action row under an AI reply — copy, regenerate, share and thumbs up/down feedback, revealed on hover.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "streaming", "compact"],
    tags: ["message", "actions", "copy", "regenerate", "feedback"],
    status: "published",
  },
  {
    name: "Error & Retry",
    slug: "error-message",
    category: "messages",
    searchTitle: "Chat Error State UI — Retry & Rate Limit",
    description:
      "What to show when a generation fails — a plain-English reason, a retry button, and a countdown for rate limits.",
    frameworks: ["react", "tailwind"],
    variants: ["error", "retrying", "rate-limit"],
    tags: ["message", "error", "retry", "failure"],
    status: "published",
  },
  {
    name: "Markdown Message",
    slug: "markdown-message",
    category: "messages",
    searchTitle: "Markdown Chat Message — React Code Blocks",
    description:
      "A rendered markdown reply — syntax-highlighted code blocks with copy buttons, plus tables, lists and safe links.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "code-block", "table"],
    tags: ["message", "markdown", "code", "render"],
    status: "published",
  },
  {
    name: "Streaming Markdown",
    slug: "streaming-markdown",
    category: "messages",
    searchTitle: "Streaming Markdown Renderer — No Flicker Mid-Token",
    description:
      "Markdown that renders correctly while it is still arriving — bold, code spans, links and tables settle without ever flashing raw syntax or reflowing.",
    frameworks: ["react", "tailwind"],
    variants: ["streaming", "settled"],
    tags: ["markdown", "streaming", "message", "rendering"],
    tier: "pro",
    status: "published",
  },
  {
    name: "Thinking / Reasoning",
    slug: "reasoning",
    category: "reasoning",
    searchTitle: "Reasoning UI — Collapsible Chain of Thought",
    description:
      "A collapsible chain-of-thought panel — show the model's reasoning trace with elapsed time, folded away by default.",
    frameworks: ["react", "tailwind"],
    variants: ["thinking", "done"],
    tags: ["reasoning", "thinking", "progress"],
    status: "published",
  },
  {
    name: "Thinking Indicator",
    slug: "thinking-indicator",
    category: "reasoning",
    searchTitle: "AI Typing Indicator — Thinking Dots in React",
    description:
      "The loading state before the first token — bouncing dots, a blinking caret, or a labeled status line while the model thinks.",
    frameworks: ["react", "tailwind"],
    variants: ["dots", "caret", "label"],
    tags: ["thinking", "indicator", "loading", "progress"],
    status: "published",
  },
  {
    name: "Reasoning Steps",
    slug: "reasoning-steps",
    category: "reasoning",
    searchTitle: "Reasoning Steps UI — Multi-Step AI Progress",
    description:
      "A multi-step reasoning trace — each step with its own status and timer, so a long think reads as progress, not a hang.",
    frameworks: ["react", "tailwind"],
    variants: ["expanded", "collapsed", "running"],
    tags: ["reasoning", "steps", "trace", "progress"],
    status: "published",
  },
  {
    name: "Tool Call",
    slug: "tool-call",
    category: "tool-calls",
    searchTitle: "Tool Call UI — React Function Calling Display",
    description:
      "How to show a function call in chat — the arguments sent, the result returned, run status, and an expand toggle.",
    frameworks: ["react", "tailwind"],
    variants: ["running", "success", "error"],
    tags: ["tool", "call", "function"],
    status: "published",
  },
  {
    name: "Search Tool Call",
    slug: "search-tool-call",
    category: "tool-calls",
    searchTitle: "Web Search Tool Call UI — Sources in Chat",
    description:
      "A web search the model ran — the query it chose, how many results came back, and previews of the sources it read.",
    frameworks: ["react", "tailwind"],
    variants: ["searching", "done"],
    tags: ["tool", "search", "web"],
    status: "published",
  },
  {
    name: "Code Execution",
    slug: "code-execution",
    category: "tool-calls",
    searchTitle: "Code Interpreter UI — React Output Panel",
    description:
      "A code interpreter run inside chat — the snippet, a running state, stdout as it streams, and errors that stay readable.",
    frameworks: ["react", "tailwind"],
    variants: ["running", "success", "error"],
    tags: ["tool", "code", "execution", "output"],
    status: "published",
  },
  {
    name: "Generative UI",
    slug: "generative-ui",
    category: "tool-calls",
    searchTitle: "Generative UI — Render React from a Tool Call",
    description:
      "Render a React component from a tool result instead of text — a skeleton in the widget's own shape, and a text fallback when the client has no renderer.",
    frameworks: ["react", "tailwind"],
    variants: ["streaming", "ready", "unsupported"],
    tags: ["generative ui", "tool", "streaming", "widget"],
    status: "published",
  },
  {
    name: "Source Card",
    slug: "source-card",
    category: "sources",
    searchTitle: "Citation Source Card — React Link Preview",
    description:
      "A cited source as a card — favicon, page title, domain, and the snippet the answer actually drew from.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "compact", "grid"],
    tags: ["source", "citation", "reference"],
    status: "published",
  },
  {
    name: "Source List",
    slug: "source-list",
    category: "sources",
    searchTitle: "RAG Retrieved Sources Panel — React",
    description:
      "The passages retrieval actually returned, with similarity scores and a visible relevance floor — including the case where nothing cleared it.",
    frameworks: ["react", "tailwind"],
    variants: ["ranked", "below-floor", "empty"],
    tags: ["retrieval", "rag", "sources", "ranking"],
    status: "published",
  },
  {
    name: "Citation UI",
    slug: "citation-ui",
    category: "sources",
    searchTitle: "Inline Citations UI — React Footnotes",
    description:
      "Inline citation markers in generated text — numbered footnotes that reveal the source in a hover preview card.",
    frameworks: ["react", "tailwind"],
    variants: ["inline", "badge", "hover-card"],
    tags: ["citation", "inline", "reference"],
    status: "published",
  },
  {
    name: "Citation Popover",
    slug: "citation-popover",
    category: "sources",
    searchTitle: "RAG Citation Popover — Passage on Hover",
    description:
      "A citation marker that shows the passage it came from — fixed positioning that survives a scrolling answer, touch and keyboard, and an honest state for a number the model invented.",
    frameworks: ["react", "tailwind"],
    variants: ["resolved", "unresolved", "scored"],
    tags: ["citation", "popover", "rag", "source", "grounding"],
    tier: "pro",
    status: "published",
  },
  {
    name: "Agent Status",
    slug: "agent-status",
    category: "agents",
    searchTitle: "AI Agent Status UI — React Task States",
    description:
      "Status for an AI agent working on its own — running, waiting on you, completed or failed, with what it did last.",
    frameworks: ["react", "tailwind"],
    variants: ["running", "waiting", "completed", "failed"],
    tags: ["agent", "status", "progress"],
    status: "published",
  },
  {
    name: "Approval Request",
    slug: "approval-request",
    category: "agents",
    searchTitle: "Human in the Loop UI — React Approval Card",
    description:
      "The human-in-the-loop confirmation — what the agent wants to do, the exact details, and allow or deny before it acts.",
    frameworks: ["react", "tailwind"],
    variants: ["pending", "approved", "denied"],
    tags: ["approval", "human-in-the-loop", "agent"],
    status: "published",
  },
  {
    name: "Approval Gate",
    slug: "approval-gate",
    category: "agents",
    searchTitle: "Human in the Loop Gate — Resumable Approval",
    description:
      "The approval card as a lifecycle: a decision that survives a closed tab, is idempotent across two open ones, and says what happened when it lands after the request expired.",
    frameworks: ["react", "tailwind"],
    variants: ["pending", "submitting", "decided-elsewhere", "expired", "reconnecting"],
    tags: ["approval", "human-in-the-loop", "agent", "resumable"],
    tier: "pro",
    status: "published",
  },
  {
    name: "Agent Plan",
    slug: "agent-plan",
    category: "agents",
    searchTitle: "AI Agent Task Plan Checklist — React",
    description:
      "The checklist an agent writes for itself and then edits mid-run — steps added, skipped and re-ordered, without the list jumping under the reader.",
    frameworks: ["react", "tailwind"],
    variants: ["planning", "running", "revised", "done"],
    tags: ["agent", "plan", "tasks", "checklist"],
    status: "published",
  },
  {
    name: "Agent Handoff",
    slug: "agent-handoff",
    category: "agents",
    searchTitle: "Multi-Agent Handoff UI — React",
    description:
      "One agent passing work to another — who asked, what was carried across, and what the receiving agent was not told.",
    frameworks: ["react", "tailwind"],
    variants: ["handing-off", "accepted", "returned"],
    tags: ["agent", "handoff", "multi-agent", "routing"],
    status: "published",
  },
  {
    name: "Response Rating",
    slug: "response-rating",
    category: "feedback",
    searchTitle: "AI Response Rating UI — Thumbs & Reasons",
    description:
      "Thumbs up and down that ask the one follow-up question worth asking — with a state for feedback that has been sent and cannot be taken back.",
    frameworks: ["react", "tailwind"],
    variants: ["idle", "reasons", "submitted"],
    tags: ["feedback", "rating", "thumbs", "eval"],
    status: "published",
  },
  {
    name: "Inline Correction",
    slug: "inline-correction",
    category: "feedback",
    searchTitle: "Inline AI Answer Correction — React",
    description:
      "Fix the answer where it is wrong, in place — the edit becomes training data, so the component keeps the original alongside it rather than overwriting it.",
    frameworks: ["react", "tailwind"],
    variants: ["reading", "editing", "corrected"],
    tags: ["feedback", "correction", "edit", "eval"],
    status: "published",
  },
  {
    name: "Output Comparison",
    slug: "output-comparison",
    category: "feedback",
    searchTitle: "A/B Model Output Comparison UI — React",
    description:
      "Two answers, side by side, with the model names hidden until a winner is picked — because a visible label is the thing being measured.",
    frameworks: ["react", "tailwind"],
    variants: ["blind", "revealed", "tie"],
    tags: ["feedback", "comparison", "ab-test", "eval"],
    status: "published",
  },
  {
    name: "Eval Results",
    slug: "eval-results",
    category: "feedback",
    searchTitle: "LLM Eval Results Table — Pass Rates & Deltas",
    description:
      "Pass rates per test case across two runs, with the regressions surfaced first and a sample size honest enough to say when a delta means nothing.",
    frameworks: ["react", "tailwind"],
    variants: ["summary", "regressions", "running"],
    tags: ["eval", "results", "regression", "testing"],
    status: "published",
  },
  {
    name: "File Upload",
    slug: "file-upload",
    category: "files",
    searchTitle: "Drag and Drop File Upload — React",
    description:
      "A drag-and-drop upload zone — per-file progress bars, type icons, and error states for files too big or of the wrong type.",
    frameworks: ["react", "tailwind"],
    variants: ["idle", "uploading", "done", "error"],
    tags: ["file", "upload", "attachment"],
    status: "published",
  },
  {
    name: "Context Files",
    slug: "context-files",
    category: "files",
    searchTitle: "Context Files UI — Token Usage in Chat",
    description:
      "The files currently in the model's context — sizes, how many tokens each one costs, and removal without leaving the chat.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "full", "empty"],
    tags: ["file", "context", "panel", "tokens"],
    status: "published",
  },
  {
    name: "Context Usage",
    slug: "context-usage",
    category: "files",
    searchTitle: "Context Window Usage Meter — React",
    description:
      "How much of the context window is gone and to what — system prompt, files, history — plus what gets dropped first when the next message does not fit.",
    frameworks: ["react", "tailwind"],
    variants: ["healthy", "tight", "overflowing"],
    tags: ["context", "tokens", "window", "usage"],
    status: "published",
  },
  {
    name: "Memory List",
    slug: "memory-list",
    category: "memory",
    searchTitle: "AI Chat Memory UI — Saved Facts Panel",
    description:
      "The memory panel — every fact the assistant has saved about the user, with the ability to add one or make it forget.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "empty"],
    tags: ["memory", "persistent", "context", "panel"],
    status: "published",
  },
  {
    name: "Memory Suggestion",
    slug: "memory-suggestion",
    category: "memory",
    searchTitle: "Memory Suggestion UI — Ask Before Saving",
    description:
      "The prompt an assistant shows before saving something about you — the fact it noticed, and your choice to keep or dismiss it.",
    frameworks: ["react", "tailwind"],
    variants: ["suggestion", "saved"],
    tags: ["memory", "suggestion", "save", "context"],
    status: "published",
  },
  {
    name: "Memory Chip",
    slug: "memory-chip",
    category: "memory",
    searchTitle: "Saved to Memory Chip — React Inline Badge",
    description:
      "A small inline chip confirming a fact was saved to memory — quiet enough to ignore, clear enough to undo.",
    frameworks: ["react", "tailwind"],
    variants: ["saved", "on"],
    tags: ["memory", "chip", "indicator"],
    status: "published",
  },
  {
    name: "Model Selector",
    slug: "model-selector",
    category: "model-settings",
    searchTitle: "AI Model Picker — React Dropdown UI",
    description:
      "A standalone model picker — compare models in a dropdown with badges for speed, context length and what each supports.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "open"],
    tags: ["model", "selector", "dropdown", "settings"],
    status: "published",
  },
  {
    name: "Reasoning Level",
    slug: "reasoning-level",
    category: "model-settings",
    searchTitle: "Reasoning Effort Control — React UI",
    description:
      "A control for how hard the model should think — light, balanced or deep, with the tradeoff between speed and depth shown.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "compact"],
    tags: ["reasoning", "effort", "control", "settings"],
    status: "published",
  },
  {
    name: "Tool Toggle",
    slug: "tool-toggle",
    category: "model-settings",
    searchTitle: "Tool Toggle Switches — React AI Settings",
    description:
      "Switches for the tools a model may use — web search, code execution, file access — with unmistakable on and off states.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "disabled"],
    tags: ["tool", "toggle", "switch", "settings"],
    status: "published",
  },
  {
    name: "Cost Meter",
    slug: "cost-meter",
    category: "model-settings",
    searchTitle: "LLM Token & Cost Meter — Live Spend UI",
    description:
      "Live spend per message and per conversation — cached input priced apart from fresh, reasoning tokens shown without double-counting, and a visible ~ when a provider did not report enough to be sure.",
    frameworks: ["react", "tailwind"],
    variants: ["message", "conversation", "approximate", "streaming"],
    tags: ["cost", "tokens", "usage", "pricing", "meter"],
    tier: "pro",
    status: "published",
  },
  {
    name: "Voice Input",
    slug: "voice-input",
    category: "voice",
    searchTitle: "Voice Input UI — React Mic & Waveform",
    description:
      "A microphone button that expands into a recording panel — live waveform, a running transcript, and cancel or send.",
    frameworks: ["react", "tailwind"],
    variants: ["idle", "recording"],
    tags: ["voice", "input", "recording", "microphone"],
    status: "published",
  },
  {
    name: "Voice Waveform",
    slug: "voice-waveform",
    category: "voice",
    searchTitle: "Audio Waveform Animation — React",
    description:
      "An animated audio waveform — distinct bar motion for listening, recording, and the assistant speaking back.",
    frameworks: ["react", "tailwind"],
    variants: ["idle", "listening", "recording", "speaking"],
    tags: ["voice", "waveform", "audio", "indicator"],
    status: "published",
  },
  {
    name: "Voice Conversation",
    slug: "voice-conversation",
    category: "voice",
    searchTitle: "Voice Chat Transcript UI — React",
    description:
      "A voice conversation as it happens — who is speaking, the live transcript, and replay for any individual turn.",
    frameworks: ["react", "tailwind"],
    variants: ["transcript", "playing"],
    tags: ["voice", "conversation", "transcript", "speaking"],
    status: "published",
  },
];

export type PatternEntry = {
  name: string;
  slug: string;
  description: string;
  elements: string[];
  tier?: Tier;
};

export const patterns: PatternEntry[] = [
  {
    name: "AI Chat",
    slug: "ai-chat",
    description:
      "The canonical chat interface — sidebar, streaming messages, prompt input with model selector, and sources.",
    elements: ["prompt-input", "streaming-message", "citation-ui"],
  },
  {
    name: "AI Research Assistant",
    slug: "research-assistant",
    description:
      "A research flow that shows search tool calls, reasoning, sources and a cited final answer.",
    elements: ["search-tool-call", "reasoning", "source-card"],
  },
  {
    name: "AI Coding Agent",
    slug: "coding-agent",
    description:
      "A coding run with agent status, tool calls, diffs and a human-in-the-loop approval gate.",
    elements: ["agent-status", "tool-call", "approval-request"],
  },
  {
    name: "AI Voice Assistant",
    slug: "voice-assistant",
    description:
      "A voice-first conversation — live waveform states, a recording input, a spoken transcript and a typed fallback.",
    elements: ["voice-input", "voice-waveform", "voice-conversation", "streaming-message", "prompt-input"],
  },
  {
    name: "Model & Memory Preferences",
    slug: "model-preferences",
    description:
      "A preferences screen that picks the model, reasoning level and tools, and manages persistent memory.",
    elements: ["model-selector", "reasoning-level", "tool-toggle", "memory-list"],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getComponent(slug: string) {
  return components.find((c) => c.slug === slug);
}

export function getPattern(slug: string) {
  return patterns.find((p) => p.slug === slug);
}

/**
 * The page heading and the structured-data name: "Tool Call" reads as a
 * component, "Tool Call UI" reads as the page about it. Guarded because three
 * entries already carry the word — "Citation UI" was rendering as
 * "Citation UI UI" — and a component named after the pattern should not be
 * renamed just to satisfy a suffix.
 */
export function displayName(entry: ComponentEntry) {
  return /\bUI$/.test(entry.name) ? entry.name : `${entry.name} UI`;
}

export function getRelated(entry: ComponentEntry, limit = 4) {
  return components
    .filter((c) => c.slug !== entry.slug && c.category === entry.category)
    .concat(components.filter((c) => c.slug !== entry.slug && c.category !== entry.category))
    .slice(0, limit);
}
