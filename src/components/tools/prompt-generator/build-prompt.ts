/* ------------------------------------------------------------------ */
/* AI Interface Prompt Generator — template engine.                    */
/* Pure, deterministic string assembly. No LLM, no React, no deps.     */
/* ------------------------------------------------------------------ */

export type InterfaceType = "chat" | "composer" | "agent" | "dashboard" | "settings" | "landing";
export type Platform = "v0" | "claude" | "cursor";
export type AiElement = "streaming" | "reasoning" | "tool-calls" | "citations" | "attachments" | "voice";

export type PromptConfig = {
  product: string;
  interfaceType: InterfaceType;
  platform: Platform;
  model: string;
  style: string;
  elements: AiElement[];
};

export type InterfaceOption = {
  value: InterfaceType;
  label: string;
  hint: string;
  base: string;
};

export type ElementOption = {
  value: AiElement;
  label: string;
  hint: string;
  line: string;
};

export const INTERFACE_OPTIONS: InterfaceOption[] = [
  {
    value: "chat",
    label: "Chat assistant",
    hint: "Header, message area, composer.",
    base: "A chat header with the assistant name, status and model, a streaming message area, and a prompt composer with a send button and a clear primary action.",
  },
  {
    value: "composer",
    label: "Prompt input / composer",
    hint: "The input row itself, with toggles and attachments.",
    base: "A prominent prompt composer with a model picker, web-search and tool toggles, and an attachment tray.",
  },
  {
    value: "agent",
    label: "Agentic workspace",
    hint: "Task sidebar, live activity feed.",
    base: "An agentic workspace: a task sidebar with the current goal and step list, plus a live activity feed of tool calls and their results.",
  },
  {
    value: "dashboard",
    label: "AI dashboard",
    hint: "Metrics, status, ongoing activity.",
    base: "An AI dashboard: a header with the model name and status, a key-metrics row, and a panel showing ongoing agent or task activity.",
  },
  {
    value: "settings",
    label: "Model & settings",
    hint: "Grouped pickers and toggles.",
    base: "A model & settings panel: grouped rows to pick the model, reasoning effort and tool toggles.",
  },
  {
    value: "landing",
    label: "Marketing / landing",
    hint: "Hero with a demo screen.",
    base: "A marketing landing page hero with a headline, a short value proposition, and a realistic AI chat or demo screen as the centerpiece.",
  },
];

export const ELEMENT_OPTIONS: ElementOption[] = [
  {
    value: "streaming",
    label: "Streaming",
    hint: "Typewriter text + caret + Stop.",
    line: "Streaming replies: reveal text incrementally with a blinking caret and a Stop control.",
  },
  {
    value: "reasoning",
    label: "Reasoning",
    hint: "Collapsible step trace.",
    line: "A collapsible reasoning trace showing the steps and elapsed time.",
  },
  {
    value: "tool-calls",
    label: "Tool calls",
    hint: "Status rows with input/output.",
    line: "Tool call rows showing status (running / success / error), input and output.",
  },
  {
    value: "citations",
    label: "Citations",
    hint: "Inline markers + sources list.",
    line: "Inline citation markers that link to a sources list.",
  },
  {
    value: "attachments",
    label: "Attachments",
    hint: "Chips with upload progress.",
    line: "Attachment chips with add / remove and upload progress.",
  },
  {
    value: "voice",
    label: "Voice",
    hint: "Waveform while recording.",
    line: "A voice input with a live waveform while recording.",
  },
];

export const PLATFORM_LABELS: Record<Platform, string> = {
  v0: "v0",
  claude: "Claude",
  cursor: "Cursor",
};

const PLATFORM_LINES: Record<Platform, string> = {
  v0: "Build this screen in v0 as a React + Tailwind CSS app.",
  claude: "Create this as a Claude.ai artifact: a single-file React + Tailwind CSS component.",
  cursor: "Implement this component in an existing React + Tailwind CSS codebase using Cursor.",
};

export const defaultPromptConfig: PromptConfig = {
  product: "An AI writing assistant that helps teams draft and refine emails",
  interfaceType: "chat",
  platform: "v0",
  model: "",
  style: "",
  elements: ["streaming", "tool-calls"],
};

const OUTPUT_LINE =
  "Output: one runnable React component (TSX) using Tailwind utility classes. No lorem ipsum or placeholder icons — produce a real, working interface.";

export function buildPrompt(config: PromptConfig): string {
  const interfaceOption =
    INTERFACE_OPTIONS.find((o) => o.value === config.interfaceType) ?? INTERFACE_OPTIONS[0];

  const lines: string[] = [
    `Build an interface for ${config.product.trim()}.`,
    "",
    `Screen: ${interfaceOption.label}`,
    "Stack: React + Tailwind CSS. Single file, no external dependencies.",
    `Platform: ${PLATFORM_LINES[config.platform]}`,
    "",
    "UI requirements:",
    `- ${interfaceOption.base}`,
  ];

  for (const element of ELEMENT_OPTIONS) {
    if (config.elements.includes(element.value)) {
      lines.push(`- ${element.line}`);
    }
  }
  lines.push(
    "- Match modern AI product conventions: subtle borders, muted secondary text, generous spacing.",
  );

  if (config.style.trim()) {
    lines.push("", `Style notes: ${config.style.trim()}`);
  }
  if (config.model.trim()) {
    lines.push("", `Model: ${config.model.trim()}`);
  }

  lines.push("", OUTPUT_LINE);
  return lines.join("\n");
}
