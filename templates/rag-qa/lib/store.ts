import type { Chunk, ChunkOptions } from "./chunk";

/**
 * The vector store, in memory.
 *
 * Say the quiet part first: **this is not a database.** It is a Map on the
 * server module scope. It does not survive a restart, it is not shared
 * between serverless instances, and on a platform that scales to more than
 * one region a document ingested by one instance is invisible to the next
 * request. Deployed as-is, the honest description is "works until it does
 * not".
 *
 * It is here anyway, and deliberately, because a template that opened with
 * "first, provision pgvector" would be a template nobody runs. Everything
 * upstream — offsets, retrieval, citations, the streaming — is the part worth
 * paying for, and none of it cares where the vectors live. So the storage is
 * the smallest thing that lets the rest be real, and it is quarantined behind
 * the five functions below.
 *
 * **Swapping it for a real store** touches this file and nothing else:
 *
 *   - `putDocument`  → one INSERT for the document, one for the chunks with
 *                      their embeddings (pgvector: `vector(1536)`).
 *   - `getDocument`  → SELECT by id.
 *   - `listDocuments`→ SELECT id, name, ... ORDER BY created_at DESC.
 *   - `searchChunks` → this is the one that changes shape. In Postgres it
 *                      becomes `ORDER BY embedding <=> $1 LIMIT k` and the
 *                      brute-force loop disappears into an index.
 *   - `deleteDocument` → DELETE, cascade to chunks.
 *
 * Keep `start` and `end` columns on the chunk table. They are the entire
 * reason citations in this template point at a sentence instead of a filename
 * (see lib/chunk.ts), and they are the first thing a schema written from a
 * tutorial leaves out.
 */

/* Server only. Not `import "server-only"` — that is one more dependency for
   a template to install, and this line does the same job: importing this
   module from a client component fails at once and loudly, instead of
   shipping the embeddings into the browser bundle. */
if (typeof window !== "undefined") {
  throw new Error("lib/store.ts was imported into client code.");
}

export type StoredChunk = Chunk & {
  embedding: number[];
};

export type StoredDocument = {
  id: string;
  name: string;
  /** The full text. Every chunk offset indexes into THIS string. */
  text: string;
  bytes: number;
  createdAt: number;
  chunking: ChunkOptions;
  chunks: StoredChunk[];
};

/** What the client is told about a document — the text and the chunk
 *  boundaries, never the embeddings. 400 chunks of 1536 floats is ~5MB of
 *  JSON the browser has no use for. */
export type DocumentSummary = {
  id: string;
  name: string;
  bytes: number;
  createdAt: number;
  chunkCount: number;
  chunking: ChunkOptions;
};

const documents = new Map<string, StoredDocument>();

/* A cap, because "in memory" plus "no eviction" is a memory leak with a
   friendlier name. Oldest out first. */
const MAX_DOCUMENTS = 20;

export function putDocument(document: StoredDocument): void {
  documents.set(document.id, document);
  while (documents.size > MAX_DOCUMENTS) {
    const oldest = documents.keys().next();
    if (oldest.done) break;
    documents.delete(oldest.value);
  }
}

export function getDocument(id: unknown): StoredDocument | undefined {
  return typeof id === "string" ? documents.get(id) : undefined;
}

export function deleteDocument(id: string): boolean {
  return documents.delete(id);
}

export function listDocuments(): DocumentSummary[] {
  return [...documents.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(summarize);
}

export function summarize(document: StoredDocument): DocumentSummary {
  return {
    id: document.id,
    name: document.name,
    bytes: document.bytes,
    createdAt: document.createdAt,
    chunkCount: document.chunks.length,
    chunking: document.chunking,
  };
}

export function newDocumentId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `d_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
