import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { DEFAULT_MODEL, isKnownModel } from "@/lib/models";
import { tools } from "@/lib/tools";

/**
 * The chat endpoint.
 *
 * Three things here are the difference between a quickstart and something you
 * can put in front of users:
 *
 *  - The model id is validated against the allowlist in lib/models.ts. It
 *    arrives in the request body from a client you do not control; without
 *    the check, anyone can point your gateway key at the priciest model on
 *    offer and run up a bill.
 *  - `stopWhen` lets the model act on a tool result instead of stopping the
 *    moment it calls one. Without it a "what's the weather?" turn ends with
 *    the tool output and no sentence — the single most common "why is my
 *    chatbot silent?" bug.
 *  - Errors are turned into a message, not a stack trace. Provider failures
 *    are routine (rate limits, context length, a model briefly down), and the
 *    default is to serialise them away as "An error occurred".
 */

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const { messages, model } = (body ?? {}) as { messages?: UIMessage[]; model?: unknown };

  if (!Array.isArray(messages)) {
    return Response.json({ error: "Expected a messages array." }, { status: 400 });
  }

  const result = streamText({
    model: isKnownModel(model) ? model : DEFAULT_MODEL,
    system:
      "You are a helpful assistant. Answer in the user's own language. " +
      "When you use a tool, explain what you found in a sentence afterwards — never end a turn on a bare tool result. " +
      "If a search returns nothing, say so plainly rather than guessing.",
    messages: await convertToModelMessages(messages),
    tools,
    /* Up to five model turns per request, so a tool result can be spoken
       about, and a second tool can follow the first. Five is a ceiling, not a
       target: it exists to stop a loop, not to encourage one. */
    stopWhen: isStepCount(5),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      /* Off by default, and the reason a reasoning model looks frozen for
         twenty seconds before anything appears. components/message.tsx
         renders these parts in the Reasoning panel. */
      sendReasoning: true,
      onError: (error) => {
        /* The message the user sees. Log the real one; hand back something
           that says what to do next without leaking provider internals —
           the default here is a flat "An error occurred". */
        console.error("[chat]", error);
        if (error instanceof Error && /rate.?limit/i.test(error.message)) {
          return "The model is rate limited right now. Wait a moment and try again.";
        }
        return "The model could not complete that response. Try again, or switch models.";
      },
    }),
  });
}
