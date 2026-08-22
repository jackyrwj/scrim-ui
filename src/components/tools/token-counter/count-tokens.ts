import type { ModelInfo, TextStats, ModelEstimate } from "./types";

export const MODEL_PRICING: ModelInfo[] = [
  { name: "GPT-4o", family: "OpenAI", inputPrice: 2.5, outputPrice: 10, multiplier: 1.33, tokenizer: "o200k_base", ratioToO200k: 1 },
  { name: "GPT-4o mini", family: "OpenAI", inputPrice: 0.15, outputPrice: 0.6, multiplier: 1.33, tokenizer: "o200k_base", ratioToO200k: 1 },
  { name: "o3-mini", family: "OpenAI", inputPrice: 1.1, outputPrice: 4.4, multiplier: 1.33, tokenizer: "o200k_base", ratioToO200k: 1 },
  { name: "Claude Sonnet 4", family: "Anthropic", inputPrice: 3, outputPrice: 15, multiplier: 1.35, tokenizer: null, ratioToO200k: 1.15 },
  { name: "Claude Haiku 3.5", family: "Anthropic", inputPrice: 0.8, outputPrice: 4, multiplier: 1.35, tokenizer: null, ratioToO200k: 1.15 },
  { name: "Claude Opus 4", family: "Anthropic", inputPrice: 15, outputPrice: 75, multiplier: 1.35, tokenizer: null, ratioToO200k: 1.15 },
  { name: "Gemini 2.5 Flash", family: "Google", inputPrice: 0.15, outputPrice: 0.6, multiplier: 1.4, tokenizer: null, ratioToO200k: 1.05 },
  { name: "Gemini 2.5 Pro", family: "Google", inputPrice: 1.25, outputPrice: 10, multiplier: 1.4, tokenizer: null, ratioToO200k: 1.05 },
];

/* ------------------------------------------------------------------ */
/* Real tokenizer — o200k_base, the encoding the GPT-4o family uses.   */
/* Loaded on demand: the rank table is a few megabytes, so nobody pays */
/* for it until they ask for an exact count.                           */
/* ------------------------------------------------------------------ */

export type Encoder = (text: string) => number[];

let encoderPromise: Promise<Encoder> | null = null;

export function loadEncoder(): Promise<Encoder> {
  if (!encoderPromise) {
    encoderPromise = import("gpt-tokenizer/encoding/o200k_base")
      .then((m) => m.encode as Encoder)
      .catch((err) => {
        encoderPromise = null;
        throw err;
      });
  }
  return encoderPromise;
}

/** The exact o200k_base token count, used as the base for every family. */
export function countExact(text: string, encode: Encoder): number {
  if (!text) return 0;
  return encode(text).length;
}

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

/**
 * `exactBase` is the o200k_base count of the same text, when the tokenizer
 * has been loaded. Models on that tokenizer report it verbatim; the rest
 * are scaled from it, which still tracks the shape of the text far better
 * than counting words. Pass null to fall back to the word heuristic.
 */
export function getEstimates(text: string, exactBase: number | null = null): ModelEstimate[] {
  return MODEL_PRICING.map((model) => {
    const isExact = exactBase !== null && model.tokenizer !== null;
    const tokens =
      exactBase === null
        ? estimateTokens(text, model.multiplier)
        : Math.round(exactBase * model.ratioToO200k);

    return {
      model,
      tokens,
      inputCost: calculateCost(tokens, model.inputPrice),
      outputCost: calculateCost(tokens, model.outputPrice),
      exact: isExact,
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
    "Tokens:",
    ...estimates.map(
      (e) =>
        `  ${e.model.name}: ${e.exact ? "" : "~"}${e.tokens} tokens${
          e.exact ? " (exact, o200k_base)" : " (estimated)"
        } | Input: ${formatCost(e.inputCost)} | Output: ${formatCost(e.outputCost)}`
    ),
  ];
  return lines.join("\n");
}
