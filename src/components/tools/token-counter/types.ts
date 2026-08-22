export type ModelInfo = {
  name: string;
  family: "OpenAI" | "Anthropic" | "Google";
  inputPrice: number;
  outputPrice: number;
  multiplier: number;
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
};

export type TokenConfig = {
  text: string;
};

export const defaultConfig: TokenConfig = { text: "" };
