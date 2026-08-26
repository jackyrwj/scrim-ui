"use client";

/**
 * The example widget for this component's demos — not part of what you copy.
 *
 * It lives in its own file rather than inline in demos.tsx because controls.tsx
 * needs the same element, and a weather card is too much markup to keep two
 * copies of in agreement. Its whole job is to look like something the app's
 * own designer built, so that the point of the surrounding component — that
 * model output and product UI become indistinguishable, and therefore need
 * labelling — is visible in the demo.
 */

export function WeatherCard() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
          <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A3.75 3.75 0 0 0 6.5 19Z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">29°</span>
          <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">Shenzhen</span>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Humid, feels like 34° · 78% humidity
        </p>
      </div>
      <div className="hidden shrink-0 gap-3 text-center sm:flex">
        {[
          ["Thu", "31°"],
          ["Fri", "28°"],
          ["Sat", "27°"],
        ].map(([day, temp]) => (
          <div key={day}>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{day}</div>
            <div className="text-xs font-medium tabular-nums text-zinc-700 dark:text-zinc-300">{temp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The same card's outline, for the streaming state. Matching the real
 *  layout is the whole point — a generic spinner would let the card jump. */
export function WeatherSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3.5">
      <div className="h-12 w-12 shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-6 w-28 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-44 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
