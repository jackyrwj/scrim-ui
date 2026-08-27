"use client";

import * as React from "react";
import { clamp } from "@/lib/safe";

/**
 * A bar chart, in inline SVG, with no chart library.
 *
 * Two reasons, and the second matters more than the first. It is one less
 * dependency — and it is one less place where a model-chosen value reaches a
 * library that will happily interpret it. A chart library's `formatter`,
 * `label` renderer or tooltip HTML is a rendering surface, and the whole
 * argument of this template is that model output should not reach one.
 *
 * The schema caps the series at eight points, so the layout is knowable
 * without measuring anything.
 */

export type ChartData = {
  title: string;
  unit: string;
  series: { label: string; value: number }[];
};

export function ChartSkeleton({ input }: { input: { title?: string } }) {
  return (
    <div>
      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {input.title || <span className="inline-block h-3.5 w-32 animate-pulse rounded bg-zinc-200 align-middle dark:bg-zinc-800" />}
      </p>
      <div className="mt-3 flex h-24 items-end gap-1.5">
        {[40, 65, 30, 80, 55, 70].map((height, i) => (
          <span
            key={i}
            className="flex-1 animate-pulse rounded-t bg-zinc-200 dark:bg-zinc-800"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MetricChart({ data }: { data: ChartData }) {
  const max = Math.max(...data.series.map((point) => point.value), 1);

  return (
    <figure>
      <figcaption className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {clamp(data.title, 60)}
        {data.unit && <span className="ml-1.5 font-normal text-zinc-500 dark:text-zinc-400">({data.unit})</span>}
      </figcaption>

      <div className="mt-3 flex h-24 items-end gap-1.5">
        {data.series.map((point, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="font-mono text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {point.value}
            </span>
            <span
              className="w-full rounded-t bg-zinc-800 transition-[height] duration-300 dark:bg-zinc-300"
              style={{ height: `${Math.max(2, (point.value / max) * 100)}%` }}
              /* The bar is decorative; the number above it and the label
                 below are the accessible content. A bar with an aria-label
                 as well would read every value twice. */
              aria-hidden
            />
          </div>
        ))}
      </div>

      <div className="mt-1 flex gap-1.5">
        {data.series.map((point, i) => (
          <span key={i} className="min-w-0 flex-1 truncate text-center text-[10px] text-zinc-500 dark:text-zinc-400">
            {point.label}
          </span>
        ))}
      </div>
    </figure>
  );
}
