export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type ComponentEntry = {
  name: string;
  slug: string;
  category: string;
  description: string;
  frameworks: string[];
  variants: string[];
  tags: string[];
  status: "published" | "planned";
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
    description: "Model selectors, reasoning levels, tool toggles and generation controls.",
  },
];

export const components: ComponentEntry[] = [
  {
    name: "Prompt Input",
    slug: "prompt-input",
    category: "prompt-input",
    description:
      "The core input for AI chat products — with attachments, model selector, tools, voice and loading states.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "with-attachments", "with-model-selector", "loading", "error", "disabled"],
    tags: ["prompt", "input", "chat", "textarea", "composer"],
    status: "published",
  },
  {
    name: "Prompt Input + Attachments",
    slug: "prompt-input-attachments",
    category: "prompt-input",
    description: "Prompt input with file attachment chips, upload progress and removal.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "uploading", "error"],
    tags: ["prompt", "input", "attachments", "files"],
    status: "published",
  },
  {
    name: "Prompt Input + Model Selector",
    slug: "prompt-input-model-selector",
    category: "prompt-input",
    description: "Prompt input with an inline model picker and capability badges.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "compact"],
    tags: ["prompt", "input", "model", "selector"],
    status: "published",
  },
  {
    name: "Streaming Message",
    slug: "streaming-message",
    category: "messages",
    description: "Assistant message that renders token-by-token with a cursor and stop control.",
    frameworks: ["react", "tailwind"],
    variants: ["streaming", "complete", "stopped"],
    tags: ["message", "streaming", "assistant"],
    status: "published",
  },
  {
    name: "User Message",
    slug: "user-message",
    category: "messages",
    description: "The user's turn — right-aligned bubble with copy, edit and regenerate actions.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "edited", "long"],
    tags: ["user", "message", "chat", "bubble", "edit"],
    status: "published",
  },
  {
    name: "Message Actions",
    slug: "message-actions",
    category: "messages",
    description: "Action row under a message — copy, regenerate, share and feedback.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "streaming", "compact"],
    tags: ["message", "actions", "copy", "regenerate", "feedback"],
    status: "published",
  },
  {
    name: "Error & Retry",
    slug: "error-message",
    category: "messages",
    description: "Assistant error state with a plain explanation and a retry or countdown action.",
    frameworks: ["react", "tailwind"],
    variants: ["error", "retrying", "rate-limit"],
    tags: ["message", "error", "retry", "failure"],
    status: "published",
  },
  {
    name: "Markdown Message",
    slug: "markdown-message",
    category: "messages",
    description: "Rendered assistant reply — code blocks with copy, tables, lists and links.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "code-block", "table"],
    tags: ["message", "markdown", "code", "render"],
    status: "published",
  },
  {
    name: "Thinking / Reasoning",
    slug: "reasoning",
    category: "reasoning",
    description: "Collapsible reasoning trace with elapsed time and step indicators.",
    frameworks: ["react", "tailwind"],
    variants: ["thinking", "done"],
    tags: ["reasoning", "thinking", "progress"],
    status: "published",
  },
  {
    name: "Thinking Indicator",
    slug: "thinking-indicator",
    category: "reasoning",
    description: "Animated pre-stream indicator — bouncing dots, a caret, or a labeled status line.",
    frameworks: ["react", "tailwind"],
    variants: ["dots", "caret", "label"],
    tags: ["thinking", "indicator", "loading", "progress"],
    status: "published",
  },
  {
    name: "Reasoning Steps",
    slug: "reasoning-steps",
    category: "reasoning",
    description: "Collapsible multi-step reasoning trace with per-step status and an elapsed timer.",
    frameworks: ["react", "tailwind"],
    variants: ["expanded", "collapsed", "running"],
    tags: ["reasoning", "steps", "trace", "progress"],
    status: "published",
  },
  {
    name: "Tool Call",
    slug: "tool-call",
    category: "tool-calls",
    description: "Generic tool call row with inputs, outputs, status and expand/collapse.",
    frameworks: ["react", "tailwind"],
    variants: ["running", "success", "error"],
    tags: ["tool", "call", "function"],
    status: "published",
  },
  {
    name: "Search Tool Call",
    slug: "search-tool-call",
    category: "tool-calls",
    description: "Web search tool call with query, result count and source previews.",
    frameworks: ["react", "tailwind"],
    variants: ["searching", "done"],
    tags: ["tool", "search", "web"],
    status: "published",
  },
  {
    name: "Code Execution",
    slug: "code-execution",
    category: "tool-calls",
    description: "Code execution tool call — the snippet, run state, stdout and error output.",
    frameworks: ["react", "tailwind"],
    variants: ["running", "success", "error"],
    tags: ["tool", "code", "execution", "output"],
    status: "published",
  },
  {
    name: "Source Card",
    slug: "source-card",
    category: "sources",
    description: "A cited source with favicon, title, domain and snippet.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "compact", "grid"],
    tags: ["source", "citation", "reference"],
    status: "published",
  },
  {
    name: "Citation UI",
    slug: "citation-ui",
    category: "sources",
    description: "Inline citation markers with hover preview cards.",
    frameworks: ["react", "tailwind"],
    variants: ["inline", "badge", "hover-card"],
    tags: ["citation", "inline", "reference"],
    status: "published",
  },
  {
    name: "Agent Status",
    slug: "agent-status",
    category: "agents",
    description: "Status UI for autonomous AI agents — running, waiting, completed and failed.",
    frameworks: ["react", "tailwind"],
    variants: ["running", "waiting", "completed", "failed"],
    tags: ["agent", "status", "progress"],
    status: "published",
  },
  {
    name: "Approval Request",
    slug: "approval-request",
    category: "agents",
    description: "Human-in-the-loop approval card with action details and allow/deny controls.",
    frameworks: ["react", "tailwind"],
    variants: ["pending", "approved", "denied"],
    tags: ["approval", "human-in-the-loop", "agent"],
    status: "published",
  },
  {
    name: "File Upload",
    slug: "file-upload",
    category: "files",
    description: "File upload dropzone with progress, type icons and error states.",
    frameworks: ["react", "tailwind"],
    variants: ["idle", "uploading", "done", "error"],
    tags: ["file", "upload", "attachment"],
    status: "published",
  },
  {
    name: "Context Files",
    slug: "context-files",
    category: "files",
    description: "Panel of files in context with sizes, token usage and inline removal.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "full", "empty"],
    tags: ["file", "context", "panel", "tokens"],
    status: "published",
  },
  {
    name: "Memory List",
    slug: "memory-list",
    category: "memory",
    description: "A memory panel — saved facts the assistant holds about the user, with add and forget.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "empty"],
    tags: ["memory", "persistent", "context", "panel"],
    status: "published",
  },
  {
    name: "Memory Suggestion",
    slug: "memory-suggestion",
    category: "memory",
    description: "Want me to remember this? — the assistant proposes saving a fact before doing it.",
    frameworks: ["react", "tailwind"],
    variants: ["suggestion", "saved"],
    tags: ["memory", "suggestion", "save", "context"],
    status: "published",
  },
  {
    name: "Memory Chip",
    slug: "memory-chip",
    category: "memory",
    description: "A compact inline chip confirming something was saved to memory.",
    frameworks: ["react", "tailwind"],
    variants: ["saved", "on"],
    tags: ["memory", "chip", "indicator"],
    status: "published",
  },
  {
    name: "Model Selector",
    slug: "model-selector",
    category: "model-settings",
    description: "A standalone model picker with capability badges for choosing the right model.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "open"],
    tags: ["model", "selector", "dropdown", "settings"],
    status: "published",
  },
  {
    name: "Reasoning Level",
    slug: "reasoning-level",
    category: "model-settings",
    description: "Controls how much the model thinks before answering — light, balanced or deep.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "compact"],
    tags: ["reasoning", "effort", "control", "settings"],
    status: "published",
  },
  {
    name: "Tool Toggle",
    slug: "tool-toggle",
    category: "model-settings",
    description: "On/off switches for tools — web search, code execution, file access and more.",
    frameworks: ["react", "tailwind"],
    variants: ["default", "disabled"],
    tags: ["tool", "toggle", "switch", "settings"],
    status: "published",
  },
  {
    name: "Voice Input",
    slug: "voice-input",
    category: "voice",
    description: "A voice input control that expands into a recording panel with waveform and transcript.",
    frameworks: ["react", "tailwind"],
    variants: ["idle", "recording"],
    tags: ["voice", "input", "recording", "microphone"],
    status: "published",
  },
  {
    name: "Voice Waveform",
    slug: "voice-waveform",
    category: "voice",
    description: "Animated waveform bars with listening, recording and speaking states.",
    frameworks: ["react", "tailwind"],
    variants: ["idle", "listening", "recording", "speaking"],
    tags: ["voice", "waveform", "audio", "indicator"],
    status: "published",
  },
  {
    name: "Voice Conversation",
    slug: "voice-conversation",
    category: "voice",
    description: "A voice conversation transcript with speaking indicators and per-turn replay.",
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

export function getRelated(entry: ComponentEntry, limit = 4) {
  return components
    .filter((c) => c.slug !== entry.slug && c.category === entry.category)
    .concat(components.filter((c) => c.slug !== entry.slug && c.category !== entry.category))
    .slice(0, limit);
}
