/**
 * The models the demo can switch between — DEMO BUILD.
 *
 * The shipped template lists four, including the expensive ones, because it
 * is your key and your call. This list is short for one reason: whatever is
 * in it, a stranger can select it, and every entry is a line item on my
 * gateway bill.
 *
 * It is also why the switcher is not simply hidden. A demo that shows four
 * models and quietly serves the cheapest is lying to the person evaluating
 * it — the switcher is one of the things being demonstrated, so it has to
 * mean what it says. Trimming the list keeps it honest AND cheap; overriding
 * the choice server-side would be only cheap.
 *
 * BEFORE YOU DEPLOY: check the current per-token price of each id at
 * vercel.com/ai-gateway. Prices move, and the second entry here is the one
 * that will surprise you.
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
    id: "google/gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    hint: "Cheapest, long context",
  },
  {
    id: "openai/gpt-5.5",
    name: "GPT-5.5",
    hint: "Fast and broad",
  },
];

/* The cheapest one, not the best one — the opposite of the template, where
   the default is the model you would actually want. */
export const DEFAULT_MODEL = MODELS[0].id;

export function isKnownModel(id: unknown): id is string {
  return typeof id === "string" && MODELS.some((m) => m.id === id);
}

export function modelName(id: string): string {
  return MODELS.find((m) => m.id === id)?.name ?? id;
}
