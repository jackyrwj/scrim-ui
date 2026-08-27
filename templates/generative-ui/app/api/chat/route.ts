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
 * Ordinary, apart from the system prompt — which in a generative UI app is
 * doing more work than usual. Telling the model *when not to* draw something
 * is most of it: a model given four widgets will use them for everything,
 * and an answer that should have been one sentence arrives as a card.
 */

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const { messages, model } = (body ?? {}) as { messages?: UIMessage[]; model?: unknown };

  if (!Array.isArray(messages)) {
    return Response.json({ error: "Expected a messages array." }, { status: 400 });
  }

  const result = streamText({
    /* Validated against lib/models.ts — the id arrives in the request body
       from a client you do not control. */
    model: isKnownModel(model) ? model : DEFAULT_MODEL,
    system: [
      "You are a helpful assistant that can render a few interface widgets.",
      "Use a widget when it shows the answer better than a sentence would: weather, flight choices, a handful of numbers to compare.",
      "Use prose for everything else. Most answers are prose.",
      "Never describe a widget you are about to render — the user can see it. Add a sentence only if there is something the widget does not show.",
      "After rendering a widget, stop. Do not follow it with a summary of its contents.",
      "Ask with askChoice when the answer is one of a few known options, rather than asking in prose.",
    ].join(" "),
    messages: await convertToModelMessages(messages),
    tools,
    /* Enough for: render a widget, read the user's choice from a client-side
       tool, then speak. Five is a ceiling, not a target. */
    stopWhen: isStepCount(5),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error("[chat]", error);
        if (error instanceof Error && /rate.?limit/i.test(error.message)) {
          return "The model is rate limited right now. Wait a moment and try again.";
        }
        return "The model could not complete that response. Try again, or switch models.";
      },
    }),
  });
}
