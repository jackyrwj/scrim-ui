import { tool } from "ai";
import { z } from "zod";

/**
 * The tools the model can call.
 *
 * Two of them, and both are stubs you are meant to replace — they exist so
 * the tool-call UI has something real to render end to end: a call that
 * streams in, an input the model chose, an output that comes back, and a
 * failure path. Swap the bodies for your own API calls; the UI does not care
 * where the data came from.
 *
 * `inputSchema` (not `parameters`) is the current name — the model reads the
 * description and the field descriptions to decide when to call, so those
 * strings are prompt engineering, not documentation.
 */
export const tools = {
  getWeather: tool({
    description:
      "Get the current weather for a city. Use whenever the user asks about weather, temperature or whether to take a coat.",
    inputSchema: z.object({
      city: z.string().describe("City name, e.g. 'Shenzhen' or 'Berlin'"),
      unit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
    }),
    execute: async ({ city, unit }) => {
      /* Replace with a real forecast API. The shape you return is what the
         model sees next AND what components/message.tsx renders, so keep it
         small and already-formatted rather than a raw provider payload. */
      const celsius = Math.round(8 + Math.random() * 22);
      const temperature = unit === "celsius" ? celsius : Math.round(celsius * 1.8 + 32);
      return {
        city,
        temperature,
        unit,
        conditions: ["clear", "cloudy", "light rain", "windy"][Math.floor(Math.random() * 4)],
      };
    },
  }),

  searchDocs: tool({
    description:
      "Search the product documentation. Use for questions about how this product works, its API, or its configuration.",
    inputSchema: z.object({
      query: z.string().describe("The search query, in the user's own words"),
    }),
    execute: async ({ query }) => {
      /* Replace with your vector store or search index. Returning an empty
         list is deliberate here — a model handed zero results should say so
         rather than invent an answer, and this is the cheapest way to see
         whether your system prompt actually makes it do that. */
      const results: { title: string; url: string; snippet: string }[] = [];
      return { query, results, note: results.length === 0 ? "No matching documents." : undefined };
    },
  }),
} as const;
