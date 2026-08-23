export type ModelInfo = {
  name: string;
  family: "OpenAI" | "Anthropic" | "Google" | "DeepSeek";
  inputPrice: number;
  outputPrice: number;
  /** Words-to-tokens factor, used before the real tokenizer is loaded. */
  multiplier: number;
  /** The public tokenizer this model uses, or null if there isn't one. */
  tokenizer: "o200k_base" | null;
  /**
   * For models with no public tokenizer: how their count compares to the
   * o200k_base count of the same text. An approximation, not a measurement.
   */
  ratioToO200k: number;
};

export type TextStats = {
  characters: number;
  words: number;
  lines: number;
  sentences: number;
};

export type ModelEstimate = {
  model: ModelInfo;
  tokens: number;
  inputCost: number;
  outputCost: number;
  /** True when `tokens` came from the model's real tokenizer. */
  exact: boolean;
};

export type TokenConfig = {
  text: string;
};

export const defaultConfig: TokenConfig = { text: "" };
