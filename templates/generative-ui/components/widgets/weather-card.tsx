"use client";

import * as React from "react";

/**
 * Weather.
 *
 * The skeleton takes the *input* — the city the model named — and the card
 * takes the *output*. So the card appears already saying "Shenzhen" while the
 * forecast is still being fetched, at the exact size it will end up. That is
 * the difference between generative UI that feels instant and three grey bars
 * that feel like a loading screen.
 */

export type WeatherData = {
  city: string;
  unit: "celsius" | "fahrenheit";
  temperature: number;
  conditions: "clear" | "cloudy" | "rain" | "snow" | "wind";
  forecast: { day: string; high: number; low: number }[];
};

const GLYPHS: Record<WeatherData["conditions"], string> = {
  clear: "M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4",
  cloudy: "M6 16a4 4 0 0 1 .9-7.9 5 5 0 0 1 9.6 1.3A3.5 3.5 0 0 1 17 16Z",
  rain: "M6 14a4 4 0 0 1 .9-7.9 5 5 0 0 1 9.6 1.3A3.5 3.5 0 0 1 17 14ZM8 18l-1 2M12 18l-1 2M16 18l-1 2",
  snow: "M6 14a4 4 0 0 1 .9-7.9 5 5 0 0 1 9.6 1.3A3.5 3.5 0 0 1 17 14ZM8 18h.01M12 19h.01M16 18h.01",
  wind: "M4 9h10a3 3 0 1 0-3-3M4 14h13a3 3 0 1 1-3 3",
};

function Icon({ conditions }: { conditions: WeatherData["conditions"] }) {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {conditions === "clear" && <circle cx="12" cy="12" r="4" />}
      <path d={GLYPHS[conditions]} />
    </svg>
  );
}

/** Same outer shape as the card, so nothing moves when the data lands. */
export function WeatherSkeleton({ input }: { input: { city?: string; unit?: string } }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {input.city || <span className="inline-block h-3.5 w-24 animate-pulse rounded bg-zinc-200 align-middle dark:bg-zinc-800" />}
        </p>
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

export function WeatherCard({ data }: { data: WeatherData }) {
  const degree = data.unit === "celsius" ? "°C" : "°F";
  return (
    <div className="flex items-center gap-4">
      <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
        <Icon conditions={data.conditions} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{data.city}</p>
        <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {data.temperature}
          <span className="text-base font-normal text-zinc-500 dark:text-zinc-400">{degree}</span>
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
