import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { DEFAULT_MODEL, isKnownModel } from "@/lib/models";
import { checkLimit } from "@/lib/rate-limit";
import { tools } from "@/lib/tools";

/**
 * The chat endpoint — DEMO BUILD.
 *
 * The shipped template's version of this file is in the zip you get with Pro,
 * and it is deliberately shorter than this one: it validates the model, sets
 * stopWhen, and turns errors into sentences. That is the right amount of
 * caution for an endpoint serving your own users on your own key.
 *
 * Everything added below exists because THIS deployment answers the open
 * internet on my key. It is a demo, not the product, and the difference is
 * the four limits stacked on top:
 *
 *   1. Rate limit per IP, before anything is spent (lib/rate-limit.ts).
 *   2. A cap on how much conversation you can send per turn.
 *   3. A cap on how much the model may write back.
 *   4. A shorter step ceiling.
 *
 * If you bought the template and are wondering whether to copy this file
 * instead: copy it if you are also putting a key in front of strangers, and
 * do not if you are not. Every limit here costs a real user something.
 */

/** Roughly a long page of text. Enough to have a conversation, not enough to
 *  paste a novel in and bill it to me. Characters rather than tokens because
 *  it has to be cheap to check and only needs to catch the abusive case. */
const MAX_INPUT_CHARS = 8_000;
/** A demo conversation that has gone 24 messages has made its point. */
const MAX_MESSAGES = 24;
/** The single most effective cost control here. Long enough for a real
 *  answer with a tool call in it, short enough that a thousand of them is
 *  still pocket change. */
const MAX_OUTPUT_TOKENS = 600;

function conversationChars(messages: UIMessage[]): number {
  let total = 0;
  for (const message of messages) {
    for (const part of message.parts ?? []) {
      if (part.type === "text") total += part.text.length;
    }
  }
  return total;
}

export async function POST(req: Request) {
  /* Before the body is even parsed: the limiter is the cheapest thing here
     and the only one that matters when someone is looping. */
  const limit = await checkLimit(req);
  if (!limit.ok) {
    return Response.json({ error: limit.message }, { status: limit.status });
  }

  const body: unknown = await req.json();
  const { messages, model } = (body ?? {}) as { messages?: UIMessage[]; model?: unknown };

  if (!Array.isArray(messages)) {
    return Response.json({ error: "Expected a messages array." }, { status: 400 });
  }

  /* Non-200 rather than a streamed error message, deliberately: useChat
     surfaces a failed response as an error, which is what renders the Error
     Message component with its Retry button. Someone who hits the cap sees a
     real state from the template rather than a chat bubble apologising. */
  if (messages.length > MAX_MESSAGES) {
    return Response.json(
      { error: "This demo conversation has gone on long enough — start a new one." },
      { status: 413 },
    );
  }
  if (conversationChars(messages) > MAX_INPUT_CHARS) {
    return Response.json(
      { error: "That is more text than the demo accepts. The template has no such limit." },
      { status: 413 },
    );
  }

  const result = streamText({
    model: isKnownModel(model) ? model : DEFAULT_MODEL,
    system:
      "You are a helpful assistant. Answer in the user's own language. " +
      "When you use a tool, explain what you found in a sentence afterwards — never end a turn on a bare tool result. " +
      "If a search returns nothing, say so plainly rather than guessing. " +
      /* Only in the demo build. Visitors ask the chatbot what it is, and an
         answer that knows is worth more than a generic one. */
      "You are running inside a public demo of the Scrim UI AI Chat template — a complete Next.js " +
      "app built on the AI SDK. If asked about yourself, say that, and mention that the demo caps " +
      "response length while the template does not. Keep answers brief.",
    messages: await convertToModelMessages(messages),
    tools,
    /* Three instead of the template's five. A step is a model call, so this
       is the difference between one runaway turn costing three requests and
       costing five. Still enough for tool, answer, and one follow-up. */
    stopWhen: isStepCount(3),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      sendReasoning: true,
      onError: (error) => {
        console.error("[demo chat]", error);
        if (error instanceof Error && /rate.?limit/i.test(error.message)) {
          return "The model is rate limited right now. Wait a moment and try again.";
        }
        return "The model could not complete that response. Try again, or switch models.";
      },
    }),
  });
}
