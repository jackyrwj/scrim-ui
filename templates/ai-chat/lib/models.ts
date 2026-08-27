/**
 * The models the chat can switch between.
 *
 * These are Vercel AI Gateway ids: one `AI_GATEWAY_API_KEY` reaches all of
 * them, which is the only reason a model *switcher* is realistic in a
 * template — with direct provider packages every entry here would be another
 * key and another dependency for whoever installs this.
 *
 * The list is also the allowlist. `app/api/chat/route.ts` refuses anything
 * not in it, because the model id arrives in the request body and an
 * unchecked one lets a stranger spend your credits on the most expensive
 * model the gateway offers.
 */

export type ChatModel = {
  id: string;
  name: string;
  hint: string;
  /** Reasoning models stream a separate thinking channel worth showing. */
  reasoning?: boolean;
};

export const MODELS: ChatModel[] = [
  {
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    hint: "Balanced — the default",
  },
  {
    id: "anthropic/claude-opus-5",
    name: "Claude Opus 5",
    hint: "Deepest reasoning",
    reasoning: true,
  },
  {
    id: "openai/gpt-5.5",
    name: "GPT-5.5",
    hint: "Fast and broad",
  },
  {
    id: "google/gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    hint: "Cheapest, long context",
  },
];

export const DEFAULT_MODEL = MODELS[0].id;

export function isKnownModel(id: unknown): id is string {
  return typeof id === "string" && MODELS.some((m) => m.id === id);
}

export function modelName(id: string): string {
  return MODELS.find((m) => m.id === id)?.name ?? id;
}
