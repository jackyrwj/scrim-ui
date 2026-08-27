import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { DEFAULT_MODEL, isKnownModel } from "@/lib/models";
import type { RagUIMessage } from "@/lib/message";
import { NO_ANSWER, SYSTEM_PROMPT, formatContext, retrieve } from "@/lib/retrieve";
import { getDocument } from "@/lib/store";

/**
 * Retrieve, then answer.
 *
 * Three decisions here are the ones that separate this from the RAG snippet
 * in every getting-started guide.
 *
 * **Sources are written before the first token.** `writer.write` puts the
 * retrieved passages — with their offsets — on the stream as a data part, and
 * only then does the model stream in behind them. The ordering is the whole
 * point: a `[2]` arriving in the third sentence has to resolve to a highlight
 * *now*, and it can, because the client has had the source list since before
 * the first word. Attaching sources at the end (the `onFinish` version) means
 * every citation is inert until the answer completes, which is precisely when
 * nobody needs them any more.
 *
 * **Nothing relevant means no model call.** If retrieval clears no chunk over
 * the floor, the route writes a fixed sentence and ends. Not a prompt that
 * asks the model to admit ignorance — an admission it cannot fail to make.
 * See lib/retrieve.ts for why that is worth doing in code rather than in
 * English.
 *
 * **Only the last question is retrieved against.** A follow-up like "and the
 * quarter before?" retrieves badly on its own, and this template does not
 * hide that: the honest fix is to rewrite the query against the conversation
 * with a cheap model first, and the seam for it is marked below. Pretending
 * the naive version works is how a demo survives one question and no more.
 */

export const maxDuration = 60;

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const { messages, documentId, model } = (body ?? {}) as {
    messages?: RagUIMessage[];
    documentId?: unknown;
    model?: unknown;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Expected a messages array." }, { status: 400 });
  }

  const document = getDocument(documentId);
  if (!document) {
    return Response.json(
      { error: "That document is no longer in the store — upload it again." },
      { status: 404 },
    );
  }

  const question = lastUserText(messages);
  if (!question) {
    return Response.json({ error: "No question in the last message." }, { status: 400 });
  }

  /* The seam for query rewriting. A one-shot call to a cheap model —
     "rewrite this follow-up as a standalone question, given the last two
     turns" — goes here, and everything downstream is unchanged because it
     still receives a string. */
  const sources = await retrieve(document, question);

  const stream = createUIMessageStream<RagUIMessage>({
    execute: async ({ writer }) => {
      /* Offsets, no text. The client already has the document and slices it
         itself — see the note in lib/message.ts for why that is structural
         rather than thrifty. */
      writer.write({
        type: "data-sources",
        data: sources.map(({ n, chunkId, start, end, score }) => ({
          n,
          chunkId,
          start,
          end,
          score,
        })),
      });

      if (sources.length === 0) {
        /* An id, because a text part needs one to be assembled on the other
           side, and a fixed one is fine for a single-part message. */
        writer.write({ type: "text-start", id: "no-answer" });
        writer.write({ type: "text-delta", id: "no-answer", delta: NO_ANSWER });
        writer.write({ type: "text-end", id: "no-answer" });
        return;
      }

      const result = streamText({
        model: isKnownModel(model) ? model : DEFAULT_MODEL,
        system: SYSTEM_PROMPT,
        messages: [
          ...(await convertToModelMessages(messages)),
          /* The passages as their own turn rather than glued to the
             question. The numbering in here is the numbering the answer will
             cite, and it came from `retrieve` — see formatContext. */
          {
            role: "user" as const,
            content: `Passages from "${document.name}":\n\n${formatContext(sources)}`,
          },
        ],
        /* Citations are a format instruction, and temperature is what makes a
           model improvise around one. Low, not zero — zero buys nothing here
           and costs fluency. */
        temperature: 0.2,
      });

      writer.merge(toUIMessageStream({ stream: result.stream }));
    },
    onError: (error) => {
      /* Log the real one, hand back something that says what to do next. The
         default is a flat "An error occurred", which is true and useless. */
      console.error("[ask]", error);
      if (error instanceof Error && /rate.?limit/i.test(error.message)) {
        return "The model is rate limited right now. Wait a moment and ask again.";
      }
      return "The model could not finish that answer. Try again, or switch models.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}

/** The question, out of the last user message's text parts. */
function lastUserText(messages: RagUIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== "user") continue;
    const text = messages[i].parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ")
      .trim();
    if (text) return text;
  }
  return "";
}
