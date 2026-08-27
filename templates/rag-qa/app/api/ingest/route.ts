import { chunkDocument, normalizeChunkOptions, verifyChunks } from "@/lib/chunk";
import { embedChunks } from "@/lib/embed";
import { ParseError, parseDocument } from "@/lib/parse";
import {
  getDocument,
  newDocumentId,
  putDocument,
  summarize,
  type StoredChunk,
  type StoredDocument,
} from "@/lib/store";

/**
 * Upload → parse → chunk → embed → store.
 *
 * The four states the uploader shows are these four steps, and they are worth
 * separating for a reason that only appears with a real file: they have
 * wildly different durations. Parsing a 6MB text file is fast, chunking it is
 * faster, and embedding four hundred chunks is several seconds of network.
 * One spinner over the lot tells a user nothing about whether to wait.
 *
 * This route reports the phases in its *response*, not as a progress stream,
 * and that is a deliberate limit: the client shows the sequence optimistically
 * while the request is in flight, then reconciles with the real timings when
 * it lands. Genuine per-phase progress means either a streamed response here
 * or a job id to poll, and both belong in the version where ingestion has
 * moved off the request path anyway (see lib/store.ts). What the UI must not
 * do is pretend the whole thing was instant.
 *
 * Re-chunking is the same endpoint with `documentId` instead of a file. That
 * is what makes the chunking controls honest: moving the size slider genuinely
 * re-cuts and re-embeds the document, so what the panel shows is what
 * retrieval will actually see — not a preview of it. It also costs an
 * embedding call per adjustment, which is the true price of that control and
 * the reason it is a button rather than a live slider.
 */

export const maxDuration = 60;

export async function POST(request: Request) {
  const started = Date.now();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected a multipart form." }, 400);
  }

  const file = form.get("file");
  const documentId = form.get("documentId");
  const options = normalizeChunkOptions(safeJson(form.get("chunking")));

  try {
    /* Two ways in, one pipeline after this point. */
    let name: string;
    let text: string;
    let bytes: number;

    if (file instanceof File) {
      const parsed = await parseDocument(file);
      ({ name, text, bytes } = parsed);
    } else if (typeof documentId === "string") {
      const existing = getDocument(documentId);
      if (!existing) {
        /* In-memory storage: a restart, or a different serverless instance.
           Say which, because "not found" for a document visible on screen is
           the most confusing error this template can produce. */
        return json(
          {
            error: "That document is no longer in the store.",
            hint: "Documents live in memory and do not survive a restart — upload it again. lib/store.ts is the file to swap for a database.",
          },
          404,
        );
      }
      ({ name, text, bytes } = existing);
    } else {
      return json({ error: "Send a file to ingest, or a documentId to re-chunk." }, 400);
    }

    const parsedAt = Date.now();
    const chunks = chunkDocument(text, options);
    if (chunks.length === 0) {
      return json({ error: "That document produced no chunks — is it empty?" }, 400);
    }
    /* The assertion from lib/chunk.ts, in development only. It is O(n) string
       comparison over the whole document — cheap next to the embedding call
       about to happen, and the person it protects is whoever edits the
       chunker. */
    if (process.env.NODE_ENV !== "production") verifyChunks(text, chunks);

    const chunkedAt = Date.now();
    const embeddings = await embedChunks(chunks.map((c) => c.text));
    const embeddedAt = Date.now();

    const stored: StoredChunk[] = chunks.map((chunk, i) => ({ ...chunk, embedding: embeddings[i] }));

    /* Re-chunking keeps the id, so the open question thread and the reading
       pane stay pointed at the same document. */
    const document: StoredDocument = {
      id: typeof documentId === "string" && getDocument(documentId) ? documentId : newDocumentId(),
      name,
      text,
      bytes,
      createdAt: Date.now(),
      chunking: options,
      chunks: stored,
    };
    putDocument(document);

    return json({
      document: summarize(document),
      /* The text goes back with the response because the reading pane renders
         it and every citation offsets into it. One copy, from the same string
         the chunks were cut from — reading it again later would be a second
         read that could, after an edit upstream, be a different string. */
      text,
      /* Boundaries only, no embeddings — see lib/store.ts. These draw the
         chunk overlay in the reading pane. */
      chunks: chunks.map(({ id, index, start, end }) => ({ id, index, start, end })),
      timings: {
        parse: parsedAt - started,
        chunk: chunkedAt - parsedAt,
        embed: embeddedAt - chunkedAt,
        total: embeddedAt - started,
      },
    });
  } catch (error) {
    if (error instanceof ParseError) {
      /* Recoverable, and the user's to fix: wrong type, too big, empty. The
         hint is rendered beside the message rather than logged. */
      return json({ error: error.message, hint: error.hint }, 400);
    }
    console.error("[ingest]", error);
    /* Everything else is the embedding provider — a rate limit, a missing
       key, a model briefly down. Say which side failed, because a flat
       "upload failed" sends the user back to try the same file again. */
    return json(
      {
        error: "The document parsed, but embedding it failed.",
        hint: "Usually a missing AI_GATEWAY_API_KEY or a rate limit. The file itself was fine — try again.",
      },
      502,
    );
  }
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

function safeJson(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
