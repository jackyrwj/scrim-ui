import type { ModelItem } from "./types";

/* ------------------------------------------------------------------ */
/* Starter model lists. Names are illustrative placeholders for        */
/* mockups — edit them to match whatever you actually ship.            */
/* ------------------------------------------------------------------ */

export type ModelPreset = {
  id: string;
  label: string;
  selectedId: string;
  models: ModelItem[];
};

export const modelPresets: ModelPreset[] = [
  {
    id: "claude",
    label: "Reasoning tiers",
    selectedId: "sonnet",
    models: [
      { id: "sonnet", name: "Claude Sonnet 4", hint: "Balanced speed and reasoning", badge: "Default", dot: "#d97757" },
      { id: "opus", name: "Claude Opus 4", hint: "Deepest reasoning, slower", badge: "Pro", dot: "#7c3aed" },
      { id: "haiku", name: "Claude Haiku 3.5", hint: "Fastest, best for short tasks", badge: "", dot: "#0ea5e9" },
    ],
  },
  {
    id: "speed-quality",
    label: "Speed vs. quality",
    selectedId: "fast",
    models: [
      { id: "fast", name: "Fast", hint: "Answers in a second or two", badge: "", dot: "#0ea5e9" },
      { id: "balanced", name: "Balanced", hint: "Good default for most chats", badge: "Default", dot: "#7c3aed" },
      { id: "thorough", name: "Thorough", hint: "Thinks longer before replying", badge: "Slow", dot: "#f59e0b" },
    ],
  },
  {
    id: "multi-provider",
    label: "Multi-provider",
    selectedId: "gpt",
    models: [
      { id: "gpt", name: "GPT-4o", hint: "OpenAI · multimodal", badge: "", dot: "#10a37f" },
      { id: "claude", name: "Claude Sonnet 4", hint: "Anthropic · long context", badge: "", dot: "#d97757" },
      { id: "gemini", name: "Gemini 2.5 Pro", hint: "Google · 1M token context", badge: "", dot: "#4285f4" },
      { id: "llama", name: "Llama 3.3 70B", hint: "Meta · open weights", badge: "Free", dot: "#0866ff" },
    ],
  },
  {
    id: "agent-modes",
    label: "Agent modes",
    selectedId: "agent",
    models: [
      { id: "ask", name: "Ask", hint: "Answers without touching files", badge: "", dot: "#71717a" },
      { id: "agent", name: "Agent", hint: "Edits files and runs commands", badge: "Default", dot: "#7c3aed" },
      { id: "review", name: "Review", hint: "Reads the diff and comments", badge: "", dot: "#10b981" },
    ],
  },
  {
    id: "two-up",
    label: "Two models only",
    selectedId: "standard",
    models: [
      { id: "standard", name: "Standard", hint: "Included in every plan", badge: "", dot: "#0ea5e9" },
      { id: "advanced", name: "Advanced", hint: "Uses one credit per message", badge: "Pro", dot: "#7c3aed" },
    ],
  },
];
