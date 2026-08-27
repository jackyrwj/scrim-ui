/**
 * The two models this template uses, and the allowlist for one of them.
 *
 * Vercel AI Gateway ids: one `AI_GATEWAY_API_KEY` reaches both the answering
 * model and the embedding model, which is the only reason a template can
 * offer a switcher without asking whoever installs it for four API keys.
 *
 * `MODELS` is also the server's allowlist. The answering model id arrives in
 * the request body from a client you do not control, and `app/api/ask` checks
 * it here — without that, a stranger can point your gateway key at the most
 * expensive model on offer.
 *
 * The embedding model deliberately is NOT switchable. Embeddings are only
 * comparable to other embeddings from the same model: change it and every
 * vector already in the store becomes noise, silently, with retrieval quietly
 * returning nonsense rather than failing. If you do change it, re-ingest
 * everything — and see EMBEDDING_DIMENSIONS below, which is the check that
 * turns that mistake into an error instead of bad answers.
 */

export type ChatModel = {
  id: string;
  name: string;
  hint: string;
};

export const MODELS: ChatModel[] = [
  {
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    hint: "Balanced — the default",
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

/** One model, not a list — see the note above about comparability. */
export const EMBEDDING_MODEL = "openai/text-embedding-3-small";

/** What EMBEDDING_MODEL returns. lib/embed.ts refuses anything else, so
 *  swapping the model without re-ingesting fails loudly at the first call
 *  rather than degrading retrieval into a random-sentence generator. */
export const EMBEDDING_DIMENSIONS = 1536;
