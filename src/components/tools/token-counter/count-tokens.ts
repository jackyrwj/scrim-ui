import type { ModelInfo, TextStats, ModelEstimate } from "./types";

export const MODEL_PRICING: ModelInfo[] = [
  { name: "GPT-4o", family: "OpenAI", inputPrice: 2.5, outputPrice: 10, multiplier: 1.33 },
  { name: "GPT-4o mini", family: "OpenAI", inputPrice: 0.15, outputPrice: 0.6, multiplier: 1.33 },
  { name: "o3-mini", family: "OpenAI", inputPrice: 1.1, outputPrice: 4.4, multiplier: 1.33 },
  { name: "Claude Sonnet 4", family: "Anthropic", inputPrice: 3, outputPrice: 15, multiplier: 1.35 },
  { name: "Claude Haiku 3.5", family: "Anthropic", inputPrice: 0.8, outputPrice: 4, multiplier: 1.35 },
  { name: "Claude Opus 4", family: "Anthropic", inputPrice: 15, outputPrice: 75, multiplier: 1.35 },
  { name: "Gemini 2.5 Flash", family: "Google", inputPrice: 0.15, outputPrice: 0.6, multiplier: 1.4 },
  { name: "Gemini 2.5 Pro", family: "Google", inputPrice: 1.25, outputPrice: 10, multiplier: 1.4 },
];

const CJK_RANGE = /[一-鿿㐀-䶿　-〿぀-ゟ゠-ヿ가-힯]/g;

function isCjkDominant(text: string): boolean {
  const cjkCount = (text.match(CJK_RANGE) || []).length;
  return cjkCount > text.length * 0.3;
}

export function countTextStats(text: string): TextStats {
  if (!text) return { characters: 0, words: 0, lines: 0, sentences: 0 };

  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split("\n").length;
  const sentences = text.trim()
    ? (text.match(/[.!?。！？]+/g) || []).length || (text.trim() ? 1 : 0)
    : 0;

  return { characters, words, lines, sentences };
}

export function estimateTokens(text: string, multiplier: number): number {
  if (!text.trim()) return 0;

  if (isCjkDominant(text)) {
    const cjkCount = (text.match(CJK_RANGE) || []).length;
    const nonCjk = text.replace(CJK_RANGE, " ").trim();
    const nonCjkWords = nonCjk ? nonCjk.split(/\s+/).filter(Boolean).length : 0;
    return Math.round(cjkCount / 1.5 + nonCjkWords * multiplier);
  }

  const words = text.trim().split(/\s+/).length;
  return Math.round(words * multiplier);
}

export function calculateCost(tokens: number, pricePerMillion: number): number {
  return tokens * pricePerMillion / 1_000_000;
}

export function getEstimates(text: string): ModelEstimate[] {
  return MODEL_PRICING.map((model) => {
    const tokens = estimateTokens(text, model.multiplier);
    return {
      model,
      tokens,
      inputCost: calculateCost(tokens, model.inputPrice),
      outputCost: calculateCost(tokens, model.outputPrice),
    };
  });
}

export function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  if (cost < 1) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

export function buildStatsSummary(stats: TextStats, estimates: ModelEstimate[]): string {
  const lines = [
    `Characters: ${stats.characters}`,
    `Words: ${stats.words}`,
    `Lines: ${stats.lines}`,
    `Sentences: ${stats.sentences}`,
    "",
    "Estimated Tokens (approximate):",
    ...estimates.map(
      (e) =>
        `  ${e.model.name}: ~${e.tokens} tokens | Input: ${formatCost(e.inputCost)} | Output: ${formatCost(e.outputCost)}`
    ),
  ];
  return lines.join("\n");
}
