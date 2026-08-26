"use client";

import { GenerativeUi, type GenerativeState } from "./generative-ui";
import { WeatherCard, WeatherSkeleton } from "./weather-card";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const DATA = `{
  "location": "Shenzhen, CN",
  "temperature": 29,
  "feelsLike": 34,
  "humidity": 0.78
}`;

const FALLBACK =
  "29° in Shenzhen, humid, feels like 34°. Update the app to see the forecast card.";

const FLIGHT_DATA = `{
  "flight": "CZ3456",
  "status": "on_time",
  "gate": "B12",
  "departs": "14:05"
}`;

const FLIGHT_FALLBACK =
  "CZ3456 is on time, departing from gate B12 at 14:05. Update the app to see the live boarding card.";

/* The widget is a child, not a prop, so the generated snippet is hand-written
   rather than assembled from the schema — see `snippet` in
   lib/component-controls.ts. The two stand-ins below are deliberately trivial:
   the component you nest here is your own, and a copy of this page's weather
   card would be the one part of the snippet nobody wants. */
const PREAMBLE = `// Your own components — whatever the app already renders.
function WeatherCard() {
  return <div className="text-sm">29° Shenzhen — humid, feels like 34°</div>;
}

function WeatherSkeleton() {
  return <div className="h-12 animate-pulse rounded-xl bg-zinc-200" />;
}`;

export const generativeUiControls: ComponentControls = {
  tag: "GenerativeUi",
  importFrom: "./generative-ui",
  controls: [
    { kind: "text", name: "tool", label: "Tool name", value: "getWeather" },
    {
      kind: "enum",
      name: "state",
      label: "State",
      value: "ready",
      options: [
        { value: "streaming", label: "Streaming" },
        { value: "ready", label: "Ready" },
        { value: "unsupported", label: "No renderer" },
      ],
    },
    { kind: "text", name: "data", label: "Tool result", value: DATA, multiline: true },
    { kind: "text", name: "fallback", label: "Text fallback", value: FALLBACK, multiline: true },
    { kind: "boolean", name: "defaultDataOpen", label: "Data open by default", value: false },
  ],
  snippet: (v) => {
    const props = [`tool="${String(v.tool)}"`, `state="${String(v.state)}"`];
    if (v.state !== "ready") props.push(`skeleton={<WeatherSkeleton />}`);
    if (v.fallback) props.push("fallback={FALLBACK_TEXT}");
    if (v.data) props.push("data={toolResultJson}");
    if (v.defaultDataOpen) props.push("defaultDataOpen");

    const open = `<GenerativeUi\n${props.map((p) => "  " + p).join("\n")}\n>`;
    // Children only render in the ready state, but they stay in the snippet
    // for every state on purpose: in a real stream one element moves through
    // all three, and a snippet that drops the child when you preview the
    // skeleton would suggest you are meant to unmount it.
    return `${PREAMBLE}\n\n${open}\n  <WeatherCard />\n</GenerativeUi>\n`;
  },
  presets: [
    {
      id: "streaming",
      title: "Streaming",
      note: "The widget's own outline, not a spinner — the card never resizes when the data lands.",
      values: { state: "streaming" },
    },
    {
      id: "ready",
      title: "Ready",
      note: "Product-grade UI from a tool result, with the attribution that says a model filled it in.",
      values: { state: "ready", defaultDataOpen: false },
    },
    {
      id: "unsupported",
      title: "No renderer",
      note: "The client does not know this widget. The answer still reads — losing the card should not lose the content.",
      // The tool changes, so the result and the fallback have to change with
      // it. A flight lookup that falls back to the weather would be a demo
      // arguing against its own point.
      values: {
        state: "unsupported",
        tool: "getFlightStatus",
        data: FLIGHT_DATA,
        fallback: FLIGHT_FALLBACK,
      },
    },
  ],
  remountOn: ["state", "defaultDataOpen"],
};

export function renderGenerativeUi(v: ControlValues, key: string) {
  return (
    <GenerativeUi
      key={key}
      tool={String(v.tool)}
      state={v.state as GenerativeState}
      skeleton={<WeatherSkeleton />}
      fallback={v.fallback ? String(v.fallback) : undefined}
      data={v.data ? String(v.data) : undefined}
      defaultDataOpen={Boolean(v.defaultDataOpen)}
    >
      <WeatherCard />
    </GenerativeUi>
  );
}
