import { embed, embedMany } from "ai";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "./models";

/**
 * Text to vectors.
 *
 * Two functions, and they are separate on purpose: `embedChunks` batches
 * (one request, many values, which is both faster and cheaper than a loop of
 * single calls), while `embedQuery` is one value on the hot path of a
 * question. Using embedMany for a single query works and costs an array
 * allocation; using embed in a loop over 400 chunks costs 400 round trips.
 *
 * The dimension check is not ceremony. Embeddings are only comparable to
 * embeddings from the same model, and the failure mode when they are not is
 * that cosine similarity keeps returning numbers — plausible ones, between 0
 * and 1 — for vectors that mean nothing to each other. Retrieval silently
 * becomes a random-passage picker and the answers just get worse. A length
 * check turns that into an exception on the first call after someone edits
 * EMBEDDING_MODEL and forgets to re-ingest.
 */

export async function embedChunks(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: texts,
    /* Providers cap values per request; the SDK splits and runs the batches
       concurrently. Four at a time is polite to a rate limit while still
       being an order of magnitude better than serial. */
    maxParallelCalls: 4,
  });
  embeddings.forEach(assertDimensions);
  return embeddings;
}

export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: EMBEDDING_MODEL, value: text });
  assertDimensions(embedding);
  return embedding;
}

function assertDimensions(vector: number[]): void {
  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS}-dimension embeddings from ${EMBEDDING_MODEL}, got ${vector.length}. ` +
        `If you changed the embedding model, update EMBEDDING_DIMENSIONS and re-ingest every document — ` +
        `vectors from two different models are not comparable, and mixing them degrades retrieval without erroring.`,
    );
  }
}

/**
 * Cosine similarity.
 *
 * `ai` exports one of these too; it is here in full because it is four lines
 * and because this is the number the whole retrieval decision rests on —
 * including RELEVANCE_FLOOR in lib/retrieve.ts, which is the difference
 * between "I don't know" and a confident answer about nothing.
 *
 * No normalisation shortcut: most embedding APIs return unit vectors, so the
 * denominator is usually 1 and the dot product alone would do. "Usually" is
 * not a property to build a threshold on.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}
