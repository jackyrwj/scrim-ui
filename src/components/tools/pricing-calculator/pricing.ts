/* The tool's real pricing math — shared by the editor page and the /tools
   card demo, so the numbers on the card come from the same code the tool
   uses. */

export type Provider = "OpenAI" | "Anthropic" | "Google" | "DeepSeek";

export interface Model {
  name: string;
  provider: Provider;
  inputPer1M: number;
  outputPer1M: number;
}

export const MODELS: Model[] = [
  { name: "GPT-4.1", provider: "OpenAI", inputPer1M: 2.0, outputPer1M: 8.0 },
  { name: "GPT-4.1 mini", provider: "OpenAI", inputPer1M: 0.4, outputPer1M: 1.6 },
  { name: "Claude Sonnet 4", provider: "Anthropic", inputPer1M: 3.0, outputPer1M: 15.0 },
  { name: "Claude Haiku 4.5", provider: "Anthropic", inputPer1M: 0.8, outputPer1M: 4.0 },
  { name: "Gemini 2.5 Pro", provider: "Google", inputPer1M: 1.25, outputPer1M: 10.0 },
  { name: "DeepSeek V3", provider: "DeepSeek", inputPer1M: 0.27, outputPer1M: 1.1 },
];

export function monthlyCost(
  model: Model,
  inputTokens: number,
  outputTokens: number,
  requestsPerDay: number,
): number {
  return (
    ((inputTokens * model.inputPer1M + outputTokens * model.outputPer1M) *
      requestsPerDay *
      30) /
    1_000_000
  );
}

export function formatUSD(value: number): string {
  if (value < 0.01) return "<$0.01";
  return `$${value.toFixed(2)}`;
}
