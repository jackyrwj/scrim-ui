/**
 * The models a run can be started with.
 *
 * Vercel AI Gateway ids: one `AI_GATEWAY_API_KEY` reaches all of them, which
 * is what makes a model picker realistic in a template — with direct provider
 * packages every entry here would be another key and another dependency.
 *
 * The list is also the allowlist. `app/api/runs/route.ts` refuses anything
 * not in it, because the model id arrives in the request body and an
 * unchecked one lets a stranger spend your credits on the most expensive
 * model the gateway offers.
 *
 * The prices are here rather than in lib/cost.ts on purpose: a model and its
 * price go stale together, and splitting them is how a cost meter ends up
 * quoting last year's rate for a model someone swapped in this morning.
 */

export type AgentModel = {
  id: string;
  name: string;
  hint: string;
  /**
   * USD per million tokens. `cachedInput` is what a cache *read* costs — it
   * is a different number from `input`, and pretending otherwise is the most
   * common way a cost meter drifts from the invoice on a long run, where most
   * of the prompt is re-read every step.
   *
   * Check these against your provider's pricing page before you show them to
   * anyone. They are correct on the day this template shipped and on no
   * particular day after that.
   */
  price: { input: number; cachedInput: number; output: number };
};

export const MODELS: AgentModel[] = [
  {
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    hint: "Balanced — the default",
    price: { input: 3, cachedInput: 0.3, output: 15 },
  },
  {
    id: "anthropic/claude-opus-5",
    name: "Claude Opus 5",
    hint: "Deepest reasoning, priciest",
    price: { input: 15, cachedInput: 1.5, output: 75 },
  },
  {
    id: "openai/gpt-5.5",
    name: "GPT-5.5",
    hint: "Fast and broad",
    price: { input: 1.25, cachedInput: 0.125, output: 10 },
  },
  {
    id: "google/gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    hint: "Cheapest, long context",
    price: { input: 0.3, cachedInput: 0.075, output: 2.5 },
  },
];

export const DEFAULT_MODEL = MODELS[0].id;

export function isKnownModel(id: unknown): id is string {
  return typeof id === "string" && MODELS.some((m) => m.id === id);
}

export function getModel(id: string): AgentModel | undefined {
  return MODELS.find((m) => m.id === id);
}

export function modelName(id: string): string {
  return getModel(id)?.name ?? id;
}
