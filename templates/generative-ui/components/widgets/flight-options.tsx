"use client";

import * as React from "react";

/**
 * Flights, and the click that goes back into the conversation.
 *
 * `onAction` is the whole reason this widget is more than a table. Selecting a
 * flight sends a message on the user's behalf — the model sees "the user
 * picked f2" and can carry on with it. Without that, everything the model
 * renders is a dead end and the user's only route back into the conversation
 * is to describe what they just clicked.
 *
 * The text sent is deliberately explicit ("Book the 08:30 Singapore Airlines
 * flight — $575") rather than an opaque id: it is going into a transcript a
 * person will re-read, and "f2" tells them nothing a week later.
 */

export type FlightData = {
  from: string;
  to: string;
  date: string;
  options: {
    id: string;
    airline: string;
    departs: string;
    arrives: string;
    durationMinutes: number;
    priceUsd: number;
    stops: number;
  }[];
};

function duration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export function FlightSkeleton({ input }: { input: { from?: string; to?: string; date?: string } }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {input.from && input.to ? `${input.from} → ${input.to}` : "Searching flights"}
        {input.date ? ` · ${input.date}` : ""}
      </p>
      <div className="mt-2 space-y-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
        ))}
      </div>
    </div>
  );
}

export function FlightOptions({ data, onAction }: { data: FlightData; onAction: (text: string) => void }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {data.from} → {data.to} · {data.date}
      </p>
      <ul className="mt-2 space-y-1.5">
        {data.options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() =>
                onAction(
                  `Book the ${option.departs} ${option.airline} flight from ${data.from} to ${data.to} — $${option.priceUsd}.`,
                )
              }
              className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                  {option.departs} → {option.arrives}
                </span>
                <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {option.airline} · {duration(option.durationMinutes)} ·{" "}
                  {option.stops === 0 ? "non-stop" : `${option.stops} stop`}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[13px] tabular-nums text-zinc-900 dark:text-zinc-100">
                ${option.priceUsd}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
