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
    label: "Grouped by provider",
    selectedId: "gpt5",
    models: [
      { id: "gpt5", name: "GPT-5", hint: "Flagship · fastest and most capable", badge: "Default", dot: "#10a37f", group: "OpenAI" },
      { id: "gpt4o", name: "GPT-4o", hint: "Balanced and multimodal", badge: "", dot: "#10a37f", group: "OpenAI" },
      { id: "opus45", name: "Claude Opus 4.5", hint: "Deepest reasoning, slower", badge: "Pro", dot: "#d97757", group: "Anthropic" },
      { id: "sonnet45", name: "Claude Sonnet 4.5", hint: "Balanced speed and quality", badge: "Default", dot: "#d97757", group: "Anthropic" },
      { id: "gemini3pro", name: "Gemini 3 Pro", hint: "Best for long context and tools", badge: "", dot: "#4285f4", group: "Google" },
    ],
  },
  {
    id: "all-providers",
    label: "All providers",
    selectedId: "gpt5",
    models: [
      { id: "gpt5", name: "GPT-5", hint: "Flagship · fastest and most capable", badge: "Default", dot: "#10a37f", group: "OpenAI" },
      { id: "gpt4o", name: "GPT-4o", hint: "Balanced and multimodal", badge: "", dot: "#10a37f", group: "OpenAI" },
      { id: "o3mini", name: "o3-mini", hint: "Reasoning on a budget", badge: "Cheap", dot: "#10a37f", group: "OpenAI" },
      { id: "opus45", name: "Claude Opus 4.5", hint: "Deepest reasoning, slower", badge: "Pro", dot: "#d97757", group: "Anthropic" },
      { id: "sonnet45", name: "Claude Sonnet 4.5", hint: "Balanced speed and quality", badge: "Default", dot: "#d97757", group: "Anthropic" },
      { id: "haiku45", name: "Claude Haiku 4.5", hint: "Fastest, best for short tasks", badge: "", dot: "#d97757", group: "Anthropic" },
      { id: "gemini3pro", name: "Gemini 3 Pro", hint: "Best for long context and tools", badge: "", dot: "#4285f4", group: "Google" },
      { id: "gemini3flash", name: "Gemini 3 Flash", hint: "Fast, cost-efficient", badge: "Fast", dot: "#4285f4", group: "Google" },
      { id: "llama4", name: "Llama 4", hint: "Open weights, self-hostable", badge: "Free", dot: "#0866ff", group: "Meta" },
      { id: "mistral-large", name: "Mistral Large", hint: "Strong coding and reasoning", badge: "", dot: "#f05133", group: "Mistral" },
      { id: "mistral-small", name: "Mistral Small", hint: "Low latency, low cost", badge: "Cheap", dot: "#f05133", group: "Mistral" },
      { id: "deepseek-v3", name: "DeepSeek V3", hint: "Open weights, cheapest", badge: "Cheap", dot: "#4d6bfe", group: "DeepSeek" },
      { id: "deepseek-r1", name: "DeepSeek R1", hint: "Open reasoning model", badge: "Reasoning", dot: "#4d6bfe", group: "DeepSeek" },
      { id: "grok4", name: "Grok 4", hint: "Real-time, opinionated", badge: "", dot: "#18181b", group: "xAI" },
      { id: "qwen3", name: "Qwen3", hint: "Open weights, multilingual", badge: "Free", dot: "#5b6bf5", group: "Qwen" },
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
