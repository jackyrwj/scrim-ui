import { z } from "zod";

/**
 * What we are pulling out of the document.
 *
 * Two decisions in here are load-bearing for the whole template, and neither
 * is obvious until you have watched a partial object render badly.
 *
 * **1. Every field is an object, not a bare value.**
 *
 * ```
 * vendor: { value: "Northwind Ltd", confidence: 0.94, evidence: "Northwind Ltd." }
 * ```
 *
 * The confidence and the evidence are worth having on their own — a person
 * checking an extraction wants to know which fields to check *first*, and
 * where each one came from. But the wrapper also solves the hardest rendering
 * problem for free.
 *
 * JSON streams in key order. So `confidence` cannot arrive until `value` is
 * **finished**. That gives every field a completion marker that costs
 * nothing: `confidence !== undefined` means "this value will not change
 * again". Without it, the only way to know whether `"Northw"` is a short
 * vendor name or a long one halfway there is to wait for the entire object.
 *
 * The general form of the trick, worth stealing: **put a cheap field after
 * any field you must not render half-finished.**
 *
 * **2. The order of the keys is the order of the form.**
 *
 * Fields render top to bottom in the order declared here, and they fill in
 * the same order, because that is the order the model emits them. A form
 * whose fields settle in a scattered order looks broken even when every value
 * is right.
 *
 * Which means: put the fields a reader most wants first at the top. They will
 * arrive first, and the useful half of the answer is readable while the rest
 * is still coming.
 */

/** Wraps a value with the two things a reviewer needs and one the UI needs. */
function extracted<T extends z.ZodType>(value: T) {
  return z.object({
    value,
    /* 0-1. Ask for it explicitly — a model that is not asked to express
       doubt will not, and every field comes back looking equally certain. */
    confidence: z.number().min(0).max(1).describe("0 to 1. Be honest: guessed values belong below 0.5."),
    /* The exact substring this was read from. Makes a wrong field checkable
       in one glance instead of a re-read of the document. */
    evidence: z.string().describe("The exact text from the document this value was read from."),
  });
}

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CNY", "other"] as const;

export const invoiceSchema = z.object({
  vendor: extracted(z.string()).describe("Who issued the invoice"),
  invoiceNumber: extracted(z.string()),
  issueDate: extracted(z.string().describe("ISO 8601, e.g. 2026-03-14")),
  dueDate: extracted(z.string().describe("ISO 8601. Empty string if the document does not say.")),
  currency: extracted(z.enum(CURRENCIES)),
  /* The array comes after the scalars deliberately. It is the field most
     likely to be long, and everything declared after it waits behind it. */
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      /* Last key in the row, so it doubles as the row's "done" marker — the
         same trick as `confidence`, one level down. */
      amount: z.number(),
    }),
  ),
  subtotal: extracted(z.number()),
  tax: extracted(z.number()),
  total: extracted(z.number()),
});

export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceField = keyof Omit<Invoice, "lineItems">;

/* ------------------------------------------------------------------ */
/* The form, derived from the schema                                   */
/* ------------------------------------------------------------------ */

/**
 * How each field is labelled and rendered.
 *
 * The *order* and the *set* of fields come from the schema — `shape` is zod's
 * public API and the keys are in declaration order. Only the human-facing
 * parts live here, and the `Record<keyof …>` type means adding a field to the
 * schema is a compile error until it has been given a label. A form that
 * silently drops a new field is the failure mode this prevents.
 *
 * `kind` is not read off the zod type on purpose. Reflecting into zod's
 * internals to ask "is this a number?" works until zod changes its internals,
 * and this is a template people will still be running in two years.
 */
export type FieldKind = "text" | "date" | "enum" | "money";

export type FieldSpec = {
  name: InvoiceField;
  label: string;
  kind: FieldKind;
  /** Renders in the right-hand column of the two-column form. */
  half?: boolean;
};

const META: Record<InvoiceField, Omit<FieldSpec, "name">> = {
  vendor: { label: "Vendor", kind: "text" },
  invoiceNumber: { label: "Invoice number", kind: "text", half: true },
  issueDate: { label: "Issued", kind: "date", half: true },
  dueDate: { label: "Due", kind: "date", half: true },
  currency: { label: "Currency", kind: "enum", half: true },
  subtotal: { label: "Subtotal", kind: "money", half: true },
  tax: { label: "Tax", kind: "money", half: true },
  total: { label: "Total", kind: "money", half: true },
};

export const FIELDS: FieldSpec[] = (Object.keys(invoiceSchema.shape) as (keyof Invoice)[])
  .filter((name): name is InvoiceField => name !== "lineItems")
  .map((name) => ({ name, ...META[name] }));

/* ------------------------------------------------------------------ */
/* Checks the schema cannot make                                       */
/* ------------------------------------------------------------------ */

/**
 * Schema-valid is not the same as right.
 *
 * `subtotal + tax = total` and `sum(lineItems) = subtotal` are the two things
 * an invoice extraction gets wrong while satisfying every type in the schema,
 * and they are the two a person would notice immediately. Surfacing them as
 * warnings — not errors — is the honest treatment: the numbers may legitimately
 * disagree (rounding, a discount line the model did not model), and blocking
 * on it would be worse than pointing at it.
 */
export type Discrepancy = { field: InvoiceField | "lineItems"; message: string };

export function findDiscrepancies(invoice: {
  lineItems?: ({ amount?: number } | undefined)[];
  subtotal?: { value?: number };
  tax?: { value?: number };
  total?: { value?: number };
}): Discrepancy[] {
  const out: Discrepancy[] = [];
  const subtotal = invoice.subtotal?.value;
  const tax = invoice.tax?.value;
  const total = invoice.total?.value;

  if (subtotal !== undefined && tax !== undefined && total !== undefined) {
    /* A cent of tolerance. Exact float equality on money read out of a PDF
       flags every second document and teaches the reader to ignore the
       warning, which is worse than not having one. */
    if (Math.abs(subtotal + tax - total) > 0.01) {
      out.push({ field: "total", message: `Subtotal + tax is ${(subtotal + tax).toFixed(2)}, not ${total.toFixed(2)}.` });
    }
  }

  const rows = invoice.lineItems?.filter((row) => row?.amount !== undefined) ?? [];
  if (rows.length > 0 && subtotal !== undefined) {
    const summed = rows.reduce((n, row) => n + (row?.amount ?? 0), 0);
    if (Math.abs(summed - subtotal) > 0.01) {
      out.push({ field: "lineItems", message: `Line items add up to ${summed.toFixed(2)}, not ${subtotal.toFixed(2)}.` });
    }
  }

  return out;
}
