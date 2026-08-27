import { z } from "zod";

/**
 * The registry: everything the model is allowed to put on screen.
 *
 * This file is the security design. Not a part of it — all of it.
 *
 * Generative UI means the model chooses what renders. Stated plainly, that is
 * a stranger's text deciding what your application draws, and every document
 * the model has read is part of that stranger's text. A page that summarises
 * a web result is one prompt injection away from rendering whatever the page
 * asked it to render, if what it renders is open-ended.
 *
 * So it is not open-ended. There are exactly four things this app can draw,
 * they are listed here, and a name that is not on the list draws prose. The
 * rules that keep it that way:
 *
 *  1. **A closed set of names.** The tools handed to the model are generated
 *     from this file (see lib/tools.ts). The model cannot invent a fifth.
 *  2. **Props are schema-validated twice** — once by the SDK on the way in,
 *     once again on the client before anything renders (see
 *     components/widgets/registry.tsx). The second check is not paranoia: the
 *     message history is client-controlled input on every turn, so a crafted
 *     history is a way to hand your renderer props no model ever produced.
 *  3. **No prop is a capability.** Nothing here takes HTML, a URL the widget
 *     will fetch, a class name, a callback name, or an event handler. Widget
 *     props are data the widget *displays*. The moment one of them is
 *     something the widget *does*, the registry has stopped being a boundary.
 *  4. **Strings are strings.** A widget renders them as text. There is no
 *     `dangerouslySetInnerHTML` in this template, and adding one would undo
 *     everything above.
 *
 * The other half of the split: this file has **no React in it**. Components
 * live in components/widgets/registry.tsx. That is deliberate — the server
 * decides what may be *called*, the client decides what may be *drawn*, and a
 * name in one but not the other degrades to readable prose instead of
 * crashing. Which happens routinely: a widget added this week, a client on
 * last week's bundle, a lazy chunk that failed to load.
 */

/* ------------------------------------------------------------------ */
/* Shared vocabulary                                                   */
/* ------------------------------------------------------------------ */

/** Bounded everywhere a model writes free text into the UI. */
const label = z.string().max(80);

/* ------------------------------------------------------------------ */
/* The widgets                                                         */
/* ------------------------------------------------------------------ */

/**
 * Every widget has two schemas, and the difference is the reason the UI feels
 * quick:
 *
 *  - `input` is what the **model** chose. It streams, token by token, and is
 *    known before any data is fetched. It always carries enough to draw the
 *    card's title.
 *  - `output` is what the **tool** returned. It is the data.
 *
 * So the card appears — correctly labelled, correctly sized — the moment the
 * model has decided to show it, and fills in when the data lands. A skeleton
 * that already says "Shenzhen" is a different experience from three grey bars,
 * and it costs one extra schema.
 */
export type WidgetSpec = {
  name: string;
  /** Read by the model to decide when to use it. Prompt engineering. */
  description: string;
  input: z.ZodType;
  output: z.ZodType;
  execute: (input: never) => Promise<unknown>;
};

const weather = {
  name: "showWeather",
  description:
    "Show a weather card for one city. Use whenever the user asks about weather, temperature, or what to wear.",
  input: z.object({
    city: label.describe("City name, as the user wrote it"),
    unit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  }),
  output: z.object({
    city: label,
    unit: z.enum(["celsius", "fahrenheit"]),
    temperature: z.number(),
    conditions: z.enum(["clear", "cloudy", "rain", "snow", "wind"]),
    /** Fixed length keeps the widget's layout knowable in advance. */
    forecast: z.array(z.object({ day: z.string().max(3), high: z.number(), low: z.number() })).length(3),
  }),
  execute: async ({ city, unit }: { city: string; unit: "celsius" | "fahrenheit" }) => {
    /* Replace with a real forecast API. */
    const base = 8 + Math.round(Math.random() * 20);
    const convert = (c: number) => (unit === "celsius" ? c : Math.round(c * 1.8 + 32));
    return {
      city,
      unit,
      temperature: convert(base),
      conditions: (["clear", "cloudy", "rain", "snow", "wind"] as const)[Math.floor(Math.random() * 5)],
      forecast: ["Mon", "Tue", "Wed"].map((day, i) => ({
        day,
        high: convert(base + 2 + i),
        low: convert(base - 4 + i),
      })),
    };
  },
} satisfies WidgetSpec;

const flights = {
  name: "showFlights",
  description:
    "Show selectable flight options between two cities. Use when the user is choosing a flight, not when they are only asking about one.",
  input: z.object({
    from: label,
    to: label,
    date: z.string().max(24).describe("The travel date as the user expressed it"),
  }),
  output: z.object({
    from: label,
    to: label,
    date: z.string().max(24),
    options: z
      .array(
        z.object({
          id: z.string().max(24),
          airline: label,
          departs: z.string().max(8),
          arrives: z.string().max(8),
          durationMinutes: z.number(),
          priceUsd: z.number(),
          stops: z.number().int().min(0).max(3),
        }),
      )
      .max(5),
  }),
  execute: async ({ from, to, date }: { from: string; to: string; date: string }) => {
    /* Replace with a real search. Capped at five on purpose: an unbounded
       list is a widget that can push the conversation off the screen, and
       "the model chose to render 400 rows" is a UI bug you cannot fix in
       CSS. */
    const airlines = ["Cathay Pacific", "Singapore Airlines", "ANA"];
    return {
      from,
      to,
      date,
      options: airlines.map((airline, i) => ({
        id: `f${i + 1}`,
        airline,
        departs: `0${7 + i}:30`,
        arrives: `1${2 + i}:05`,
        durationMinutes: 275 + i * 40,
        priceUsd: 480 + i * 95,
        stops: i === 2 ? 1 : 0,
      })),
    };
  },
} satisfies WidgetSpec;

const chart = {
  name: "showChart",
  description:
    "Show a small bar chart. Use for a handful of numbers the user is comparing — never for a single value, and never for more than eight bars.",
  input: z.object({
    title: label,
    unit: z.string().max(12).default(""),
  }),
  output: z.object({
    title: label,
    unit: z.string().max(12),
    series: z.array(z.object({ label: z.string().max(16), value: z.number() })).min(2).max(8),
  }),
  execute: async ({ title, unit }: { title: string; unit: string }) => {
    /* Replace with your metrics store. The bounds on `series` are not
       cosmetic — they are what stops a widget deciding its own height. */
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return {
      title,
      unit,
      series: months.map((label) => ({ label, value: Math.round(20 + Math.random() * 80) })),
    };
  },
} satisfies WidgetSpec;

export const WIDGETS = [weather, flights, chart] as const;

export type WidgetName = (typeof WIDGETS)[number]["name"];

export function getWidget(name: string): WidgetSpec | undefined {
  return WIDGETS.find((widget) => widget.name === name);
}

/* ------------------------------------------------------------------ */
/* The one that asks back                                              */
/* ------------------------------------------------------------------ */

/**
 * A widget whose whole job is to produce an answer.
 *
 * It has no `execute`, which is what makes it a **client-side tool**: the SDK
 * emits the call and waits, the browser renders the choice, and the user's
 * click becomes the tool's output. The model then reads that output and
 * carries on, exactly as if a server had returned it.
 *
 * This is the piece that turns generative UI from a nicer transcript into an
 * interface. Without it, everything the model renders is a dead end and the
 * user's only way back into the conversation is to describe what they just
 * clicked.
 */
export const askChoice = {
  name: "askChoice",
  description:
    "Ask the user to pick one of a few options. Use instead of asking in prose when the answer is one of a small, known set.",
  input: z.object({
    question: z.string().max(160),
    options: z.array(z.object({ id: z.string().max(24), label, hint: z.string().max(80).optional() })).min(2).max(4),
  }),
} as const;

export type AskChoiceInput = z.infer<typeof askChoice.input>;
