"use client";

import * as React from "react";
import { getWidget } from "@/lib/widgets";
import { WeatherCard, WeatherSkeleton, type WeatherData } from "./weather-card";
import { FlightOptions, FlightSkeleton, type FlightData } from "./flight-options";
import { MetricChart, ChartSkeleton, type ChartData } from "./metric-chart";

/**
 * What the client is allowed to draw.
 *
 * The other half of the boundary. lib/widgets.ts decides what the model may
 * **call**; this decides what the browser may **draw**, and the two are
 * separate on purpose.
 *
 * They fall out of sync constantly, and none of it is exceptional: a widget
 * shipped on the server this morning and a browser tab open since yesterday,
 * a lazy chunk that failed on a bad connection, an old build cached on a
 * phone. In every one of those the model produced a usable answer and only
 * the renderer is missing — so the miss renders as prose, never as an error
 * and never as a blank card. Throwing away a correct answer because the
 * client cannot draw it is the worst outcome available.
 *
 * And the check that matters: **props are validated here, again.** The SDK
 * validated them on the server, and that is not enough on its own — the
 * message history is client-controlled input on every turn, so a crafted
 * history is a way to hand a renderer props no model ever produced. Zod is
 * already in the bundle for the schemas; the second parse costs microseconds
 * and closes the gap.
 */

type Renderer = {
  /** Drawn from the model's streamed tool INPUT, before any data arrives. */
  Skeleton: (props: { input: Record<string, unknown> }) => React.ReactNode;
  /** Drawn from the validated tool OUTPUT. */
  Widget: (props: { data: never; onAction: (text: string) => void }) => React.ReactNode;
};

const RENDERERS: Record<string, Renderer> = {
  showWeather: {
    Skeleton: ({ input }) => <WeatherSkeleton input={input as { city?: string; unit?: string }} />,
    Widget: ({ data }) => <WeatherCard data={data as WeatherData} />,
  },
  showFlights: {
    Skeleton: ({ input }) => <FlightSkeleton input={input as { from?: string; to?: string; date?: string }} />,
    Widget: ({ data, onAction }) => <FlightOptions data={data as FlightData} onAction={onAction} />,
  },
  showChart: {
    Skeleton: ({ input }) => <ChartSkeleton input={input as { title?: string }} />,
    Widget: ({ data }) => <MetricChart data={data as ChartData} />,
  },
};

export type RenderResult =
  | { kind: "skeleton"; node: React.ReactNode }
  | { kind: "widget"; node: React.ReactNode }
  | { kind: "unsupported"; reason: string };

/** The placeholder for a widget whose data has not arrived yet. */
export function renderSkeleton(name: string, input: unknown): RenderResult {
  const renderer = RENDERERS[name];
  if (!renderer) return { kind: "unsupported", reason: `No renderer for ${name}.` };
  return {
    kind: "skeleton",
    /* Partial input, straight from the stream. Every skeleton has to cope
       with every field being absent — the model has decided *what* to show
       long before it has finished saying *about what*. */
    node: <renderer.Skeleton input={(input as Record<string, unknown>) ?? {}} />,
  };
}

/** The widget itself, if and only if everything checks out. */
export function renderWidget(name: string, output: unknown, onAction: (text: string) => void): RenderResult {
  const spec = getWidget(name);
  if (!spec) return { kind: "unsupported", reason: `${name} is not in the registry.` };

  const renderer = RENDERERS[name];
  if (!renderer) return { kind: "unsupported", reason: `This version of the app cannot display ${name}.` };

  const parsed = spec.output.safeParse(output);
  if (!parsed.success) {
    /* Shape-valid on the server, wrong here. Almost always a version skew —
       the client is parsing against an older schema than the one the server
       produced. It is not a crash and it is not a security incident, but it
       is not something to render either. */
    return { kind: "unsupported", reason: `The ${name} result did not match this app's schema.` };
  }

  return { kind: "widget", node: <renderer.Widget data={parsed.data as never} onAction={onAction} /> };
}
