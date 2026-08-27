/**
 * The AI model vendors the model-switcher demos and the homepage strip are
 * built around.
 *
 * Names are chosen so <BrandIcon> resolves a real mark from src/lib/brands.ts
 * (CC0 paths); a vendor without a mark there — Grok — falls back to the
 * two-letter avatar, which is exactly how BrandIcon already behaves elsewhere.
 * The blurb is the short version of what each vendor is known for, shown as a
 * tooltip on the strip.
 */
export const MODEL_VENDORS = [
  { name: "OpenAI", blurb: "GPT-5.6 · Sol · Terra · Luna" },
  { name: "Anthropic", blurb: "Claude Fable 5 · Opus 5 · Sonnet 5 · Haiku" },
  { name: "Google", blurb: "Gemini 3.1 Pro · 3.7 Flash" },
  { name: "Meta", blurb: "Llama 4 · open weights" },
  { name: "Mistral", blurb: "Large 3 · Medium 3.5" },
  { name: "DeepSeek", blurb: "V4 Pro · V4 Flash · open weights" },
  { name: "Grok", blurb: "Grok 4.6" },
  { name: "Qwen", blurb: "Qwen 3.8 · multilingual" },
];
