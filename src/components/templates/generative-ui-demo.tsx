"use client";

import * as React from "react";
import { GenerativeUi } from "@/showcase/generative-ui/generative-ui";
import { PromptInput } from "@/showcase/prompt-input/prompt-input";
import { ThinkingIndicator } from "@/showcase/thinking-indicator/thinking-indicator";
import { useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The Generative UI template, rendering components it was asked for — and
 * declining to render one it was not.
 *
 * The tempting demo is three beautiful cards. That demo is a lie by omission,
 * because the interesting half of this template is the boundary: a registry
 * of names, checked twice, with a readable answer for every name that is not
 * in it. So the script deliberately walks into the failure:
 *
 *   1. Two weather cards, skeleton first — the skeleton is drawn from the
 *      model's streamed *input*, so the card says "Reykjavík" at its final
 *      size before any forecast exists.
 *   2. `showItinerary`, which the server can call and this client cannot
 *      draw. It degrades to prose with the raw result behind a toggle,
 *      because a model that produced a usable answer should not have it
 *      thrown away by a browser that is one deploy behind.
 *   3. A question the browser answers. `askChoice` is a client-side tool —
 *      no `execute` on the server — so the click becomes the tool output and
 *      the conversation carries on. That one is live: it waits for you.
 *
 * No model, no key, no route. Stated under the frame rather than left for
 * someone to discover.
 */

/* Mirrors templates/generative-ui/lib/models.ts. A copy, deliberately: the
   template is a standalone app with its own tsconfig, and reaching into it
   from the site would couple the two builds to save four lines. */
const MODELS = [
  { id: "anthropic/claude-sonnet-5", name: "Claude Sonnet 5", hint: "Balanced — the default" },
  { id: "openai/gpt-5.6-terra", name: "GPT-5.6 Terra", hint: "Fast and broad" },
  { id: "google/gemini-3.7-flash", name: "Gemini 3.7 Flash", hint: "Cheapest, long context" },
];

type Weather = {
  city: string;
  temperature: number;
  conditions: "clear" | "cloudy" | "rain" | "snow" | "wind";
  forecast: { day: string; high: number; low: number }[];
};

const WEATHER: Weather[] = [
  {
    city: "Lisbon",
    temperature: 21,
    conditions: "clear",
    forecast: [
      { day: "Thu", high: 22, low: 14 },
      { day: "Fri", high: 23, low: 15 },
      { day: "Sat", high: 20, low: 13 },
    ],
  },
  {
    city: "Reykjavík",
    temperature: 3,
    conditions: "wind",
    forecast: [
      { day: "Thu", high: 4, low: -1 },
      { day: "Fri", high: 2, low: -3 },
      { day: "Sat", high: 5, low: 0 },
    ],
  },
];

const ITINERARY_RESULT = `{
  "city": "Reykjavík",
  "days": [
    { "day": 1, "title": "Old harbour and the thermal pools" },
    { "day": 2, "title": "Golden Circle, leaving before first light" },
    { "day": 3, "title": "Reykjanes lava fields, then the airport" }
  ]
}`;

const CHOICES = [
  { id: "lisbon", label: "Lisbon", hint: "21°C and clear" },
  { id: "reykjavik", label: "Reykjavík", hint: "3°C and windy" },
  { id: "neither", label: "Somewhere else", hint: "Start again" },
];

const ANSWERS: Record<string, string> = {
  lisbon: "Lisbon it is. Three clear days and nothing under 13°C — you can pack for one season.",
  reykjavik:
    "Reykjavík then. Take the itinerary above as a starting point, and something windproof: the 3°C is not the part you will feel.",
  neither: "Fair enough. Tell me a region and roughly when, and I will put two or three side by side.",
};

/* ------------------------------------------------------------------ */
/* The script                                                          */
/* ------------------------------------------------------------------ */

type Phase =
  | "empty"
  | "submitted"
  | "streaming"
  | "cards"
  | "asked"
  | "unsupported"
  | "choice";

const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "empty", ms: 900 },
  { phase: "submitted", ms: 1100 },
  { phase: "streaming", ms: 1800 },
  { phase: "cards", ms: 3200 },
  { phase: "asked", ms: 1400 },
  { phase: "unsupported", ms: 4200 },
  /* The last screen has no duration that matters: it stops here and waits
     for a click, because a scripted answer to a question the model asked
     would be a demonstration of the opposite feature. */
  { phase: "choice", ms: 600000 },
];

const ORDER: Phase[] = TIMELINE.map((t) => t.phase);
const at = (phase: Phase, min: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(min);

export function GenerativeUiDemo({ caption = true }: { caption?: boolean }) {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [step, setStep] = React.useState(0);
  const [chosen, setChosen] = React.useState<string | null>(null);

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);

  /* Reduced motion gets the last screen: every widget on it, including the
     one that could not be drawn, and the question still live. */
  const phase = reduced ? "choice" : TIMELINE[step].phase;
  const playing = inView && !reduced && phase !== "choice";

  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setStep((s) => Math.min(s + 1, TIMELINE.length - 1)), TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [playing, step]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [phase, chosen]);

  function replay() {
    setChosen(null);
    setStep(0);
  }

  const busy = phase === "submitted" || phase === "streaming" || phase === "asked";
  const status = phase === "submitted" ? "submitted" : busy ? "streaming" : "ready";

  return (
    <div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border border-(--border)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-3 border-b border-(--border) bg-(--muted) px-3 py-2">
          <div className="flex gap-1.5" aria-hidden>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full opacity-60" style={{ background: c }} />
            ))}
          </div>
          <span className="hidden truncate text-[11px] text-(--muted-foreground) sm:inline">
            localhost:3000
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--border) bg-(--card) px-2 py-0.5 font-mono text-[10px] text-(--muted-foreground)">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: busy ? "var(--primary)" : "#22c55e" }}
              aria-hidden
            />
            status: {status}
          </span>
          <button
            type="button"
            onClick={replay}
            className="shrink-0 rounded-md border border-(--border) bg-(--card) px-2 py-0.5 text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Replay
          </button>
        </div>

        {/* The app, in the app's own palette rather than the site's — a
            preview that adopts the surrounding theme tokens shows you this
            page, not the thing you are buying. */}
        <div className="flex h-[28rem] flex-col bg-white text-zinc-900 sm:h-[32rem] dark:bg-zinc-950 dark:text-zinc-100">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">
              {phase === "empty" ? (
                <div className="pt-20 text-center">
                  <h3 className="text-lg font-semibold tracking-tight">Three widgets and a question</h3>
                  <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-zinc-500">
                    Weather, flights, or a chart — nothing else. Ask for anything outside that set
                    and it answers in prose, which is the point.
                  </p>
                </div>
              ) : (
                <>
                  <UserMessage>What&rsquo;s the weather in Lisbon and Reykjavík?</UserMessage>

                  {phase === "submitted" && <ThinkingIndicator />}

                  {at(phase, "streaming") && (
                    <div className="space-y-3">
                      <p className="text-[13px] leading-6 text-zinc-800 dark:text-zinc-200">
                        Both, side by side:
                      </p>

                      {/* The registry answering yes. Skeleton first, drawn
                          from the model's streamed input — the card already
                          says the city, at the size it will end up. */}
                      {WEATHER.map((w) => (
                        <GenerativeUi
                          key={w.city}
                          tool="showWeather"
                          state={at(phase, "cards") ? "ready" : "streaming"}
                          skeleton={<WeatherSkeleton city={w.city} />}
                          data={at(phase, "cards") ? JSON.stringify(w, null, 2) : undefined}
                        >
                          <WeatherCard data={w} />
                        </GenerativeUi>
                      ))}
                    </div>
                  )}

                  {at(phase, "asked") && (
                    <UserMessage>Plan me three days in the colder one.</UserMessage>
                  )}

                  {phase === "asked" && <ThinkingIndicator />}

                  {at(phase, "unsupported") && (
                    <div className="space-y-3">
                      {/* The registry answering no. The server called
                          `showItinerary`; this build has no renderer for it,
                          so the answer is read out rather than thrown away. */}
                      <GenerativeUi
                        tool="showItinerary"
                        state="unsupported"
                        data={ITINERARY_RESULT}
                        fallback="This build of the app cannot draw showItinerary — it was added to the server after this page was deployed. The result is readable below."
                      />
                      <p className="text-[13px] leading-6 text-zinc-800 dark:text-zinc-200">
                        Three days in Reykjavík: the harbour and the thermal pools, then the Golden
                        Circle before first light, then the Reykjanes lava fields on the way to the
                        airport.
                      </p>
                    </div>
                  )}

                  {at(phase, "choice") && (
                    <div className="space-y-3">
                      {/* A client-side tool: no `execute` on the server, so
                          the SDK emits the call and waits for the browser.
                          The click becomes the tool output. */}
                      <GenerativeUi tool="askChoice" state="ready">
                        <AskChoice
                          question="Which one am I booking?"
                          options={CHOICES}
                          answered={chosen ? CHOICES.find((c) => c.id === chosen)?.label : undefined}
                          onChoose={(id) => setChosen(id)}
                        />
                      </GenerativeUi>

                      {chosen && (
                        <p className="text-[13px] leading-6 text-zinc-800 dark:text-zinc-200">
                          {ANSWERS[chosen]}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
            <div className="mx-auto max-w-2xl">
              <PromptInput
                models={MODELS}
                defaultModel={MODELS[0].id}
                placeholder={busy ? "Generating…" : "Ask for weather, flights, or a chart…"}
                loading={busy}
                onSubmit={replay}
                onStop={replay}
              />
            </div>
          </div>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
          The third widget is the one worth reading:{" "}
          <code className="font-mono text-[11px]">showItinerary</code> is a name the server can produce
          and this build cannot draw, so it degrades to prose with the raw result behind a toggle
          rather than to a blank card. The question at the bottom is live — it is a client-side tool,
          and it waits for you. Everything else is scripted; there is no model behind this page.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-3.5 py-2 text-[13px] leading-6 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
        {children}
      </div>
    </div>
  );
}

const GLYPHS: Record<Weather["conditions"], string> = {
  clear: "M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4",
  cloudy: "M6 16a4 4 0 0 1 .9-7.9 5 5 0 0 1 9.6 1.3A3.5 3.5 0 0 1 17 16Z",
  rain: "M6 14a4 4 0 0 1 .9-7.9 5 5 0 0 1 9.6 1.3A3.5 3.5 0 0 1 17 14ZM8 18l-1 2M12 18l-1 2M16 18l-1 2",
  snow: "M6 14a4 4 0 0 1 .9-7.9 5 5 0 0 1 9.6 1.3A3.5 3.5 0 0 1 17 14ZM8 18h.01M12 19h.01M16 18h.01",
  wind: "M4 9h10a3 3 0 1 0-3-3M4 14h13a3 3 0 1 1-3 3",
};

/** Same outer shape as the card, so nothing moves when the data lands. */
function WeatherSkeleton({ city }: { city: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="min-w-0 flex-1">
        {/* The city is already known — it came in the tool input, which
            streams before the tool has run. */}
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{city}</p>
        <span className="mt-1.5 inline-block h-6 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="hidden gap-4 sm:flex">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-8 w-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

function WeatherCard({ data }: { data: Weather }) {
  return (
    <div className="flex items-center gap-4">
      <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {data.conditions === "clear" && <circle cx="12" cy="12" r="4" />}
          <path d={GLYPHS[data.conditions]} />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{data.city}</p>
        <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {data.temperature}
          <span className="text-base font-normal text-zinc-500 dark:text-zinc-400">°C</span>
        </p>
        <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">{data.conditions}</p>
      </div>
      <div className="hidden gap-4 text-center sm:flex">
        {data.forecast.map((day) => (
          <div key={day.day}>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{day.day}</p>
            <p className="font-mono text-xs tabular-nums text-zinc-900 dark:text-zinc-100">{day.high}</p>
            <p className="font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{day.low}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * `answered` renders the chosen option instead of the buttons. Not for
 * tidiness — a set of live buttons above a conversation that has already
 * moved past them is an invitation to click something twice.
 */
function AskChoice({
  question,
  options,
  answered,
  onChoose,
}: {
  question: string;
  options: { id: string; label: string; hint?: string }[];
  answered?: string;
  onChoose: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-900 dark:text-zinc-100">{question}</p>
      {answered ? (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-[13px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {answered}
        </p>
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChoose(option.id)}
              title={option.hint}
              className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
