import { cosineSimilarity, embedQuery } from "./embed";
import type { StoredDocument } from "./store";

/**
 * Retrieval, and the decision to not answer.
 *
 * The retrieval itself is the easy half: embed the question, score every
 * chunk, take the best few. Brute force over an in-memory array, which is
 * correct up to a few thousand chunks and becomes `ORDER BY embedding <=> $1`
 * the day it is not (see lib/store.ts).
 *
 * The half that makes RAG trustworthy is below it. A vector search ALWAYS
 * returns its top k — that is what "top k" means. Ask a document about
 * quarterly revenue what the weather is, and you get back three chunks with
 * scores around 0.1, which the prompt then presents to the model as The
 * Relevant Context. The model, being agreeable, writes a paragraph. It is
 * fluent, it is cited, and it is about nothing.
 *
 * That single failure is why people stop trusting a RAG feature, and no
 * amount of "only answer from the context" in a system prompt fixes it,
 * because from the model's side the context looks like an answer someone went
 * to the trouble of retrieving. The fix is upstream and it is arithmetic:
 * chunks below RELEVANCE_FLOOR do not reach the prompt, and if that leaves
 * nothing, the route says so without calling the model at all.
 */

export type Retrieved = {
  /** 1-based, and the number that appears in `[1]` in the answer. */
  n: number;
  chunkId: string;
  start: number;
  end: number;
  score: number;
  text: string;
};

/**
 * The cutoff, in cosine similarity.
 *
 * 0.28 is a starting point for text-embedding-3-small on English prose, not a
 * law. Tune it against your own corpus — with short chunks scores run lower
 * across the board, and a domain where everything is about one topic runs
 * higher. Two ways to be wrong, and they are not symmetric: too high and the
 * app says "I don't know" about things the document plainly answers, which is
 * annoying but visible; too low and it invents, which is invisible until a
 * user acts on it.
 *
 * Print the scores while you tune. The panel in components/sources.tsx shows
 * them for exactly this reason.
 */
export const RELEVANCE_FLOOR = 0.28;

/** How many chunks reach the prompt. More context is not more accuracy —
 *  past about five the model starts averaging across passages instead of
 *  answering from the best one, and every extra chunk is input tokens. */
export const TOP_K = 5;

export async function retrieve(
  document: StoredDocument,
  question: string,
): Promise<Retrieved[]> {
  const queryVector = await embedQuery(question);

  const scored = document.chunks
    .map((chunk) => ({ chunk, score: cosineSimilarity(queryVector, chunk.embedding) }))
    .sort((a, b) => b.score - a.score);

  return scored
    .filter((c) => c.score >= RELEVANCE_FLOOR)
    .slice(0, TOP_K)
    .map(({ chunk, score }, i) => ({
      n: i + 1,
      chunkId: chunk.id,
      /* The offsets ride all the way through. This is the payload the
         citation UI resolves back into a highlight — drop these two fields
         and the best you can do at the other end is name the file. */
      start: chunk.start,
      end: chunk.end,
      score,
      text: chunk.text,
    }));
}

/**
 * The retrieved passages, as the model sees them.
 *
 * The numbering is the contract. `[1]` in the prompt and `[1]` in the answer
 * and `sources[0].n` in the UI are the same thing, and if they ever stop
 * being the same thing every citation in the app points at the wrong
 * passage while looking perfectly fine. Which is why the numbers come from
 * `retrieve` above rather than being assigned again here.
 */
export function formatContext(sources: Retrieved[]): string {
  return sources
    .map((s) => `[${s.n}] ${s.text}`)
    .join("\n\n---\n\n");
}

export const SYSTEM_PROMPT = [
  "You answer questions about one document, using only the numbered passages you are given.",
  "",
  "Cite constantly. After every sentence that draws on a passage, put its number in square",
  "brackets — like this [2] — with no space before the bracket. A sentence supported by two",
  "passages gets both: [1][3]. Never invent a number that is not in the passages, and never",
  "cite a passage you did not use for that sentence.",
  "",
  "If the passages do not contain the answer, say so in one sentence and stop. Do not fill the",
  "gap from general knowledge, do not guess, and do not pad the reply with what the document",
  "does say instead unless the reader asked for it. A wrong answer costs more than a missing one.",
  "",
  "Answer in the language the question was asked in. Be brief — this is a document, the reader",
  "can go and read it, and the citations are what get them there.",
].join("\n");

/** What the route streams instead of calling the model, when nothing cleared
 *  the floor. Deterministic on purpose: this is the one answer that must not
 *  vary with temperature, and not paying a model to say it is a bonus. */
export const NO_ANSWER =
  "I could not find anything in this document that answers that. Nothing in it was close " +
  "enough to the question to be worth quoting, so rather than guess: it is not in here, or " +
  "it is phrased differently enough that the search missed it — try naming a term the " +
  "document itself would use.";
