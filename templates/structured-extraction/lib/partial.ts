/**
 * Reading a half-arrived object.
 *
 * This is the file the template exists for. Everything else is a form.
 *
 * `useObject` hands you a new snapshot on every chunk, each one a slightly
 * more complete version of the last. The naive thing is to render whatever is
 * in it. That produces the three failures that make a streaming form look
 * broken rather than alive:
 *
 *  1. **Values that are wrong, not partial.** `"Northwind"` on its way to
 *     `"Northwind Ltd"` is a partial *string* and reads fine. `12` on its way
 *     to `1234.56` is not a partial number — it is a **wrong** number, shown
 *     with total confidence, for as long as it takes the next four characters
 *     to arrive. Nobody reading a total of $12 forgives you at $1,234.56.
 *  2. **Flicker.** A value that renders, changes, and changes again pulls the
 *     eye to whichever field is least finished.
 *  3. **Layout shift.** Fields appearing one by one push everything below them
 *     down, so the thing someone is reading moves while they read it.
 *
 * The fixes, in order of how much they matter:
 *
 *  - **Know when a value is final.** See lib/schema.ts: every field is
 *    `{ value, confidence, evidence }`, and JSON streams in key order, so
 *    `confidence !== undefined` proves `value` is finished. No guessing, no
 *    debounce, no "wait 200ms and hope".
 *  - **Render strings as they arrive, numbers only when settled.** A number
 *    mid-flight shows a shimmer of the right width instead. This is the
 *    single highest-value line in the template.
 *  - **Render the form before the data.** The fields come from the schema, so
 *    every row exists — empty — from the first frame. Nothing moves as values
 *    land, because nothing is being added.
 */

export type FieldState =
  /** Nothing yet. Renders as an empty row of the right height. */
  | "empty"
  /** Mid-value. Strings show what there is; numbers show a shimmer. */
  | "arriving"
  /** Will not change again. */
  | "settled";

export type PartialField<T> = { value?: T; confidence?: number; evidence?: string } | undefined;

/**
 * @param field  the field's slice of the partial object
 * @param done   the stream has finished — every present value is final, and
 *               anything still missing is missing for good
 */
export function fieldState(field: PartialField<unknown>, done: boolean): FieldState {
  if (field?.value === undefined || field.value === "") return done ? "settled" : "empty";
  /* The whole trick: a key that comes AFTER `value` in the schema proves
     `value` is closed. See lib/schema.ts. */
  if (field.confidence !== undefined || done) return "settled";
  return "arriving";
}

/**
 * A line item's state.
 *
 * Rows have no `confidence` to lean on, so the marker is `amount` — the last
 * key in the row — plus the fact that a row can only be under construction if
 * it is the last one in the array.
 */
export function rowState(
  row: { amount?: number } | undefined,
  isLast: boolean,
  done: boolean,
): FieldState {
  if (!row) return done ? "settled" : "empty";
  if (row.amount !== undefined) return "settled";
  if (done) return "settled";
  return isLast ? "arriving" : "settled";
}

/**
 * Text, safe to show while it is still arriving.
 *
 * Strings are the one type where partial output is honest: a name that is
 * half-typed still reads as a name being typed. The caller pairs this with a
 * caret so it is visibly in progress rather than visibly truncated.
 */
export function partialText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Money, or nothing.
 *
 * Returns `undefined` for anything not settled, and the caller draws a
 * placeholder. Resist the urge to render the number "so the layout is right" —
 * the placeholder is what keeps the layout right, and it does not lie.
 */
export function settledNumber(value: unknown, state: FieldState): number | undefined {
  if (state !== "settled") return undefined;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function formatMoney(amount: number, currency: string | undefined): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency && currency !== "other" ? currency : "USD",
      currencyDisplay: currency && currency !== "other" ? "symbol" : "code",
    }).format(amount);
  } catch {
    /* An invalid currency code from a model is a routine event, not a crash. */
    return amount.toFixed(2);
  }
}

/**
 * How sure the model says it is, in words.
 *
 * A bare "0.62" asks the reader to decide what 0.62 means. Three bands and a
 * colour answer the only question they have: do I need to check this one?
 */
export function confidenceBand(confidence: number | undefined): "high" | "medium" | "low" | "unknown" {
  if (confidence === undefined) return "unknown";
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}
