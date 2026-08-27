"use client";

import * as React from "react";
import { formatMoney, rowState } from "@/lib/partial";

/**
 * The rows.
 *
 * An array is the part of a streaming object that shifts the layout most:
 * rows appear one at a time, and each one pushes the totals below it down the
 * page — which is where the reader's eye is.
 *
 * Two things fix it, and neither is clever:
 *
 *  - **Every row is exactly one line tall**, whatever the description. Long
 *    descriptions truncate.
 *  - **A ghost row holds the bottom edge** while the array is still growing,
 *    so the table's height changes by one row at a time in a predictable
 *    place instead of jumping.
 *
 * The numbers follow the same rule as everywhere else: a quantity or an
 * amount is shown only once the row is settled. A row whose `amount` has not
 * arrived is a row whose earlier numbers may still be mid-digit.
 */

export type PartialRow = {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
};

export function LineItems({
  rows,
  currency,
  done,
  warning,
}: {
  rows: (PartialRow | undefined)[] | undefined;
  currency: string | undefined;
  done: boolean;
  warning?: string;
}) {
  const list = rows ?? [];

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Line items
        </h2>
        {list.length > 0 && (
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{list.length}</span>
        )}
      </div>

      <div className="mt-1.5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full table-fixed border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-[11px] uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="w-16 px-3 py-2 text-right font-medium">Qty</th>
              <th className="w-24 px-3 py-2 text-right font-medium">Unit</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-zinc-400 dark:text-zinc-500">
                  {done ? "No line items found." : "Waiting for line items…"}
                </td>
              </tr>
            )}

            {list.map((row, index) => {
              const state = rowState(row, index === list.length - 1, done);
              const settled = state === "settled";
              return (
                <tr
                  key={index}
                  className="h-9 border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                >
                  <td className="truncate px-3 text-zinc-800 dark:text-zinc-200" title={row?.description}>
                    {row?.description ?? ""}
                    {state === "arriving" && !row?.description && (
                      <span className="inline-block h-3 w-32 animate-pulse rounded bg-zinc-200 align-middle dark:bg-zinc-800" />
                    )}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                    {settled && row?.quantity !== undefined ? row.quantity : <Shimmer width="w-6" show={!settled} />}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                    {settled && row?.unitPrice !== undefined ? (
                      formatMoney(row.unitPrice, currency)
                    ) : (
                      <Shimmer width="w-14" show={!settled} />
                    )}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                    {settled && row?.amount !== undefined ? (
                      formatMoney(row.amount, currency)
                    ) : (
                      <Shimmer width="w-16" show={!settled} />
                    )}
                  </td>
                </tr>
              );
            })}

            {/* The ghost row. Only while the list can still grow — once the
                stream is done it would be a promise of a row that is not
                coming. */}
            {!done && list.length > 0 && (
              <tr className="h-9 border-b border-zinc-100 last:border-0 dark:border-zinc-800/60" aria-hidden>
                <td className="px-3">
                  <span className="inline-block h-3 w-40 animate-pulse rounded bg-zinc-100 align-middle dark:bg-zinc-900" />
                </td>
                <td colSpan={3} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {warning && <p className="mt-1 text-[11px] leading-4 text-amber-700 dark:text-amber-400">{warning}</p>}
    </div>
  );
}

function Shimmer({ width, show }: { width: string; show: boolean }) {
  if (!show) return <span className="text-zinc-400">—</span>;
  return <span className={`inline-block h-3 ${width} animate-pulse rounded bg-zinc-200 align-middle dark:bg-zinc-800`} />;
}
