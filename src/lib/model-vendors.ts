/**
 * The AI model vendors the model-switcher demos and the homepage strip are
 * built around.
 *
 * Names are chosen so <BrandIcon> resolves a real mark from src/lib/brands.ts
 * (CC0 paths); a vendor without a mark there — xAI — falls back to the
 * two-letter avatar, which is exactly how BrandIcon already behaves elsewhere.
 * The blurb is the short version of what each vendor is known for, shown as a
 * tooltip on the strip.
 */
export const MODEL_VENDORS = [
  { name: "OpenAI", blurb: "GPT-5 · GPT-4o · o3" },
  { name: "Anthropic", blurb: "Claude Opus · Sonnet · Haiku" },
  { name: "Google", blurb: "Gemini 3 Pro · Flash" },
  { name: "Meta", blurb: "Llama · open weights" },
  { name: "Mistral", blurb: "Large · Small" },
  { name: "DeepSeek", blurb: "V3 · R1 · open weights" },
  { name: "xAI", blurb: "Grok 4" },
  { name: "Qwen", blurb: "Qwen3 · multilingual" },
];
