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
      { id: "sonnet", name: "Claude Sonnet 5", hint: "Balanced speed and reasoning", badge: "Default", dot: "#d97757" },
      { id: "opus", name: "Claude Opus 5", hint: "Deepest reasoning, slower", badge: "Pro", dot: "#7c3aed" },
      { id: "haiku", name: "Claude Haiku 4.5", hint: "Fastest, best for short tasks", badge: "", dot: "#0ea5e9" },
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
    selectedId: "gpt56sol",
    models: [
      { id: "gpt56sol", name: "GPT-5.6 Sol", hint: "Flagship · most capable", badge: "Default", dot: "#10a37f", group: "OpenAI" },
      { id: "gpt56terra", name: "GPT-5.6 Terra", hint: "Balanced and multimodal", badge: "", dot: "#10a37f", group: "OpenAI" },
      { id: "fable5", name: "Claude Fable 5", hint: "Most advanced Claude model", badge: "Pro", dot: "#d97757", group: "Anthropic" },
      { id: "sonnet5", name: "Claude Sonnet 5", hint: "Balanced speed and quality", badge: "", dot: "#d97757", group: "Anthropic" },
      { id: "gemini31pro", name: "Gemini 3.1 Pro", hint: "Best for long context and tools", badge: "", dot: "#4285f4", group: "Google" },
    ],
  },
  {
    id: "all-providers",
    label: "All providers",
    selectedId: "gpt56sol",
    models: [
      { id: "gpt56sol", name: "GPT-5.6 Sol", hint: "Flagship · most capable", badge: "Default", dot: "#10a37f", group: "OpenAI" },
      { id: "gpt56terra", name: "GPT-5.6 Terra", hint: "Balanced and multimodal", badge: "", dot: "#10a37f", group: "OpenAI" },
      { id: "gpt56luna", name: "GPT-5.6 Luna", hint: "Fast, high-volume", badge: "Cheap", dot: "#10a37f", group: "OpenAI" },
      { id: "fable5", name: "Claude Fable 5", hint: "Most advanced Claude model", badge: "Pro", dot: "#d97757", group: "Anthropic" },
      { id: "sonnet5", name: "Claude Sonnet 5", hint: "Balanced speed and quality", badge: "Default", dot: "#d97757", group: "Anthropic" },
      { id: "haiku45", name: "Claude Haiku 4.5", hint: "Fastest, best for short tasks", badge: "", dot: "#d97757", group: "Anthropic" },
      { id: "gemini31pro", name: "Gemini 3.1 Pro", hint: "Best for long context and tools", badge: "", dot: "#4285f4", group: "Google" },
      { id: "gemini37flash", name: "Gemini 3.7 Flash", hint: "Fast, cost-efficient", badge: "Fast", dot: "#4285f4", group: "Google" },
      { id: "llama4", name: "Llama 4", hint: "Open weights, self-hostable", badge: "Free", dot: "#0866ff", group: "Meta" },
      { id: "mistral-large", name: "Mistral Large 3", hint: "Strong coding and reasoning", badge: "", dot: "#f05133", group: "Mistral" },
      { id: "mistral-medium", name: "Mistral Medium 3.5", hint: "Low latency, low cost", badge: "Cheap", dot: "#f05133", group: "Mistral" },
      { id: "deepseek-v4", name: "DeepSeek V4 Flash", hint: "Open weights, cheapest", badge: "Cheap", dot: "#4d6bfe", group: "DeepSeek" },
      { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", hint: "Open flagship, reasoning", badge: "Reasoning", dot: "#4d6bfe", group: "DeepSeek" },
      { id: "grok46", name: "Grok 4.6", hint: "Real-time, opinionated", badge: "", dot: "#18181b", group: "xAI" },
      { id: "qwen38", name: "Qwen 3.8 Max", hint: "Multilingual, open ecosystem", badge: "", dot: "#5b6bf5", group: "Qwen" },
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

/* Per-provider lineups derived from the all-providers preset — the vendor
   buttons in the editor load one of these as a starting point. Group order
   follows the preset's model order. */
export const vendorLineups: { vendor: string; models: ModelItem[] }[] = (() => {
  const all = modelPresets.find((p) => p.id === "all-providers");
  const groups = new Map<string, ModelItem[]>();
  for (const m of all?.models ?? []) {
    if (!m.group) continue;
    const list = groups.get(m.group) ?? [];
    list.push(m);
    groups.set(m.group, list);
  }
  return [...groups].map(([vendor, models]) => ({ vendor, models }));
})();
