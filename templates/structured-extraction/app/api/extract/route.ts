import { createTextStreamResponse, Output, streamText, toTextStream } from "ai";
import { DEFAULT_MODEL, isKnownModel } from "@/lib/models";
import { invoiceSchema } from "@/lib/schema";

/**
 * The extraction endpoint.
 *
 * `Output.object` with `streamText` rather than `generateObject`: the client
 * needs the fields as they are produced, not the finished object. That single
 * choice is what the whole UI is built on — see lib/partial.ts for what it
 * costs and how it is paid for.
 *
 * The response is a plain text stream of JSON fragments, which is what
 * `useObject` on the other end expects.
 */

/* Structured extraction from a long document is not a one-second request. */
export const maxDuration = 60;

/* ~40k characters. A limit is not optional on an endpoint that takes a
   document and bills per token: without one, a single paste decides how much
   the request costs. Truncating with a note beats a 413 for anyone pasting a
   long contract by accident. */
const MAX_CHARS = 40_000;

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const { document, model } = (body ?? {}) as { document?: unknown; model?: unknown };

  if (typeof document !== "string" || document.trim().length === 0) {
    return Response.json({ error: "Expected a document." }, { status: 400 });
  }

  const text = document.slice(0, MAX_CHARS);

  const result = streamText({
    /* Validated against the allowlist in lib/models.ts — the id arrives in
       the request body from a client you do not control. */
    model: isKnownModel(model) ? model : DEFAULT_MODEL,
    output: Output.object({ schema: invoiceSchema }),
    system: [
      "You extract invoice data from documents.",
      "Read only what is in the document. Never infer a value that is not written down.",
      "If a field is genuinely absent, use an empty string for text and 0 for numbers, and set that field's confidence below 0.3.",
      "`evidence` must be an exact substring of the document — copy it, do not paraphrase.",
      "Be honest in `confidence`. A value you had to interpret does not belong above 0.6.",
    ].join(" "),
    prompt: `Extract the invoice fields from this document.\n\n---\n${text}\n---`,
    onError: ({ error }) => {
      /* Log the real one. The client shows a generic message: a provider
         error string is not something to put in front of a user. */
      console.error("[extract]", error);
    },
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
