"use client";

import * as React from "react";
import { useInView, useReducedMotion } from "./use-demo-motion";

/**
 * The Structured Extraction template, filling in a form as the object
 * arrives.
 *
 * This is the one template whose selling point is invisible in a screenshot.
 * A finished form is a finished form; the argument is entirely about the two
 * seconds before it is finished, and specifically about one rule:
 *
 *   **A string mid-flight is a partial string. A number mid-flight is a
 *   WRONG number.**
 *
 * "Northwind" on its way to "Northwind Ltd" reads fine. `12` on its way to
 * `1,234.56` is not a partial total — it is a confident, wrong total, shown
 * for as long as the next four characters take to arrive. So text reveals
 * under a caret and money never renders until it is final, holding its space
 * with a shimmer. Watch the Total row: it goes from rule, to shimmer, to
 * number, and never through a smaller number.
 *
 * The rows exist from the first frame because they come from the zod schema,
 * not from the response — which is why nothing below the field being filled
 * ever moves.
 *
 * Scripted, obviously: no model, no key, no route. The timeline below is the
 * shape of a real `Output.object` stream (keys in schema order, `value`
 * before `confidence`), replayed at reading speed.
 */

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type Kind = "text" | "date" | "enum" | "money";

type FieldSpec = { key: string; label: string; kind: Kind; half?: boolean };

/* Mirrors FIELDS in templates/structured-extraction/lib/schema.ts, where the
   list is derived from the schema's own shape. A copy, deliberately: the
   template is a standalone app with its own tsconfig, and reaching into it
   from the site would couple the two builds. */
const FIELDS: FieldSpec[] = [
  { key: "vendor", label: "Vendor", kind: "text" },
  { key: "invoiceNumber", label: "Invoice number", kind: "text", half: true },
  { key: "issueDate", label: "Issued", kind: "date", half: true },
  { key: "dueDate", label: "Due", kind: "date", half: true },
  { key: "currency", label: "Currency", kind: "enum", half: true },
  { key: "subtotal", label: "Subtotal", kind: "money", half: true },
  { key: "tax", label: "Tax", kind: "money", half: true },
  { key: "total", label: "Total", kind: "money", half: true },
];

type Extracted = { value: string | number | null; confidence: number; evidence: string };
type Row = { description: string; quantity: number; amount: number };

type Sample = {
  name: string;
  hint: string;
  text: string;
  fields: Record<string, Extracted>;
  rows: Row[];
  /** Cross-field checks that only exist once everything has landed. */
  warnings?: Record<string, string>;
};

/* The same three documents the template ships in lib/samples.ts — chosen to
   fail in different ways, because a demo that only shows the clean case
   teaches nothing about the day the extraction goes wrong. */
const SAMPLES: Sample[] = [
  {
    name: "Clean invoice",
    hint: "Everything present and consistent",
    text: `NORTHWIND LTD
17 Fleet Street, London EC4Y 1AA

INVOICE  NW-2026-0418
Issued: 14 March 2026
Due: 13 April 2026

Bill to: Scrim UI

Description                Qty   Unit      Amount
Design system audit          1   2,400.00  2,400.00
Component implementation    12     180.00  2,160.00
Documentation pass           6     120.00    720.00

                         Subtotal  GBP 5,280.00
                       VAT (20%)   GBP 1,056.00
                            Total  GBP 6,336.00`,
    fields: {
      vendor: { value: "Northwind Ltd", confidence: 0.97, evidence: "NORTHWIND LTD" },
      invoiceNumber: { value: "NW-2026-0418", confidence: 0.98, evidence: "INVOICE  NW-2026-0418" },
      issueDate: { value: "2026-03-14", confidence: 0.94, evidence: "Issued: 14 March 2026" },
      dueDate: { value: "2026-04-13", confidence: 0.94, evidence: "Due: 13 April 2026" },
      currency: { value: "GBP", confidence: 0.96, evidence: "GBP 5,280.00" },
      subtotal: { value: 5280, confidence: 0.95, evidence: "Subtotal  GBP 5,280.00" },
      tax: { value: 1056, confidence: 0.93, evidence: "VAT (20%)   GBP 1,056.00" },
      total: { value: 6336, confidence: 0.96, evidence: "Total  GBP 6,336.00" },
    },
    rows: [
      { description: "Design system audit", quantity: 1, amount: 2400 },
      { description: "Component implementation", quantity: 12, amount: 2160 },
      { description: "Documentation pass", quantity: 6, amount: 720 },
    ],
  },
  {
    name: "Missing due date",
    hint: "A field that is genuinely absent — watch the confidence",
    text: `ACME SUPPLY CO
Invoice #A-9931
Date: 2026-01-07

2 x Widget assembly @ 45.00 ......... 90.00
1 x Rush handling @ 25.00 ........... 25.00

Subtotal ............ 115.00
Sales tax (8.25%) ..... 9.49
TOTAL USD ........... 124.49

Payment terms: on receipt.`,
    fields: {
      vendor: { value: "Acme Supply Co", confidence: 0.96, evidence: "ACME SUPPLY CO" },
      invoiceNumber: { value: "A-9931", confidence: 0.97, evidence: "Invoice #A-9931" },
      issueDate: { value: "2026-01-07", confidence: 0.98, evidence: "Date: 2026-01-07" },
      /* The honest answer, and the reason the schema asks for confidence at
         all: the document says "on receipt", so a due date can be inferred
         and should not be trusted. */
      dueDate: { value: "2026-01-07", confidence: 0.31, evidence: "Payment terms: on receipt." },
      currency: { value: "USD", confidence: 0.92, evidence: "TOTAL USD ........... 124.49" },
      subtotal: { value: 115, confidence: 0.97, evidence: "Subtotal ............ 115.00" },
      tax: { value: 9.49, confidence: 0.95, evidence: "Sales tax (8.25%) ..... 9.49" },
      total: { value: 124.49, confidence: 0.97, evidence: "TOTAL USD ........... 124.49" },
    },
    rows: [
      { description: "Widget assembly", quantity: 2, amount: 90 },
      { description: "Rush handling", quantity: 1, amount: 25 },
    ],
  },
  {
    name: "Numbers that do not add up",
    hint: "Schema-valid and wrong — see the discrepancy warning",
    text: `Studio Mercator
Rechnung 2026-0042 · 22.02.2026 · fällig 24.03.2026

Positionen
Fotoproduktion, 2 Tage à 1.250,00 EUR ..... 2.500,00
Retusche, 14 Bilder à 60,00 EUR ............. 840,00
Lizenz, 12 Monate ......................... 1.200,00

Zwischensumme ............................ 4.540,00
USt. 19% ................................... 862,60
Gesamt ................................... 5.302,60`,
    fields: {
      vendor: { value: "Studio Mercator", confidence: 0.95, evidence: "Studio Mercator" },
      invoiceNumber: { value: "2026-0042", confidence: 0.93, evidence: "Rechnung 2026-0042" },
      issueDate: { value: "2026-02-22", confidence: 0.91, evidence: "22.02.2026" },
      dueDate: { value: "2026-03-24", confidence: 0.9, evidence: "fällig 24.03.2026" },
      currency: { value: "EUR", confidence: 0.94, evidence: "1.250,00 EUR" },
      subtotal: { value: 4540, confidence: 0.92, evidence: "Zwischensumme ... 4.540,00" },
      tax: { value: 862.6, confidence: 0.9, evidence: "USt. 19% ... 862,60" },
      total: { value: 5302.6, confidence: 0.88, evidence: "Gesamt ... 5.302,60" },
    },
    rows: [
      { description: "Fotoproduktion, 2 Tage", quantity: 2, amount: 2500 },
      { description: "Retusche, 14 Bilder", quantity: 14, amount: 840 },
      { description: "Lizenz, 12 Monate", quantity: 12, amount: 1200 },
    ],
    /* Every field is high-confidence and the arithmetic is still wrong. No
       amount of per-field confidence catches this one — it is a check
       between fields, run after the stream ends. */
    warnings: {
      total: "Subtotal + tax is 5,402.60, not 5,302.60.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* The stream, as a timeline                                           */
/* ------------------------------------------------------------------ */

/** One slot in the arrival order — schema order, which is stream order. */
type Slot = { kind: "field"; key: string; ms: number } | { kind: "row"; index: number; ms: number };

function slotsFor(sample: Sample): Slot[] {
  const before = FIELDS.slice(0, 5).map((f) => ({ kind: "field" as const, key: f.key, ms: 520 }));
  const rows = sample.rows.map((_, index) => ({ kind: "row" as const, index, ms: 460 }));
  const after = FIELDS.slice(5).map((f) => ({ kind: "field" as const, key: f.key, ms: 620 }));
  return [...before, ...rows, ...after];
}

/** Where a slot sits on the clock. */
function windowOf(slots: Slot[], at: number): { start: number; end: number } {
  let start = 0;
  for (let i = 0; i < at; i++) start += slots[i].ms;
  return { start, end: start + slots[at].ms };
}

type FieldState = "empty" | "arriving" | "settled";

const HOLD_MS = 4200;

export function StructuredExtractionDemo({ caption = true }: { caption?: boolean }) {
  const frameRef = React.useRef<HTMLDivElement>(null);

  const [sampleIndex, setSampleIndex] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  /* Bumped by Replay. The clock is read from wall time, so restarting it
     needs something in the effect's deps to change — the elapsed value going
     back to zero is not that, since the effect never looked at it. */
  const [generation, setGeneration] = React.useState(0);
  const [corrections, setCorrections] = React.useState<Record<string, string>>({});

  const reduced = useReducedMotion();
  const inView = useInView(frameRef);

  const sample = SAMPLES[sampleIndex];
  const slots = React.useMemo(() => slotsFor(sample), [sample]);
  const duration = slots.reduce((ms, slot) => ms + slot.ms, 0);

  /* Reduced motion gets the finished object: the form is the deliverable,
     and it survives being still. The streaming argument is made in prose
     under the frame for anyone who will not see it move. */
  const t = reduced ? duration : Math.min(elapsed, duration);
  const done = t >= duration;

  const playing = inView && !reduced;

  /* Driven off elapsed wall time rather than a per-tick counter, so a tab
     that was backgrounded resumes at the right place instead of finishing a
     burst of queued ticks. */
  React.useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      const since = performance.now() - started;
      if (since > duration + HOLD_MS) {
        /* On to the next document. Three failures shown in rotation beats one
           shown well, because the clean case is the one nobody needed to see. */
        setSampleIndex((i) => (i + 1) % SAMPLES.length);
        setElapsed(0);
        setCorrections({});
        setGeneration((g) => g + 1);
        return;
      }
      setElapsed(since);
    }, 40);
    return () => window.clearInterval(id);
  }, [playing, duration, generation]);

  function pick(index: number) {
    setSampleIndex(index);
    setElapsed(0);
    setCorrections({});
    setGeneration((g) => g + 1);
  }

  function stateOf(slotIndex: number): FieldState {
    if (done) return "settled";
    const { start, end } = windowOf(slots, slotIndex);
    if (t < start) return "empty";
    if (t >= end) return "settled";
    return "arriving";
  }

  /** How far through its own window a slot is — the reveal for text. */
  function ratioOf(slotIndex: number): number {
    const { start, end } = windowOf(slots, slotIndex);
    return Math.max(0, Math.min(1, (t - start) / (end - start)));
  }

  const slotIndexOf = (key: string) => slots.findIndex((s) => s.kind === "field" && s.key === key);
  const rowSlotIndexOf = (index: number) => slots.findIndex((s) => s.kind === "row" && s.index === index);

  const status = done ? "ready" : t > 0 ? "streaming" : "submitted";

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
              style={{ background: done ? "#22c55e" : "var(--primary)" }}
              aria-hidden
            />
            status: {status}
          </span>
          <button
            type="button"
            onClick={() => pick(sampleIndex)}
            className="shrink-0 rounded-md border border-(--border) bg-(--card) px-2 py-0.5 text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Replay
          </button>
        </div>

        {/* The app, in the app's own palette rather than the site's — a
            preview that adopts the surrounding theme tokens shows you this
            page, not the thing you are buying. */}
        <div className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
            {SAMPLES.map((s, i) => (
              <button
                key={s.name}
                type="button"
                onClick={() => pick(i)}
                title={s.hint}
                className={`rounded-lg px-2.5 py-1 text-[12px] transition-colors ${
                  i === sampleIndex
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="grid h-[26rem] grid-cols-1 sm:h-[30rem] sm:grid-cols-2">
            {/* The document. Hidden on narrow screens: it is context, and the
                form is the thing being demonstrated. */}
            <div className="hidden min-h-0 overflow-y-auto border-r border-zinc-200 bg-zinc-50 p-3.5 sm:block dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Document
              </p>
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-5 text-zinc-600 dark:text-zinc-400">
                {sample.text}
              </pre>
            </div>

            <div className="min-h-0 overflow-y-auto p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Extracted
                </p>
                {!done && (
                  <span className="font-mono text-[10px] text-zinc-400">
                    {Math.round((t / duration) * 100)}%
                  </span>
                )}
              </div>

              {/* Every row exists from the first frame, because the rows come
                  from the schema and not from the response. Nothing is
                  inserted as values land, so nothing below moves. */}
              <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                {FIELDS.map((spec) => {
                  const slotIndex = slotIndexOf(spec.key);
                  const state = stateOf(slotIndex);
                  const data = sample.fields[spec.key];
                  return (
                    <Field
                      key={spec.key}
                      spec={spec}
                      state={state}
                      ratio={ratioOf(slotIndex)}
                      data={data}
                      currency={
                        stateOf(slotIndexOf("currency")) === "settled"
                          ? String(sample.fields.currency.value)
                          : undefined
                      }
                      correction={corrections[spec.key]}
                      warning={done ? sample.warnings?.[spec.key] : undefined}
                      onCorrect={(next) =>
                        setCorrections((c) => {
                          const copy = { ...c };
                          if (next === undefined) delete copy[spec.key];
                          else copy[spec.key] = next;
                          return copy;
                        })
                      }
                    />
                  );
                })}
              </div>

              <p className="mb-1.5 mt-4 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Line items
              </p>
              <table className="w-full table-fixed">
                <tbody>
                  {sample.rows.map((row, i) => {
                    const state = stateOf(rowSlotIndexOf(i));
                    if (state === "empty") return <GhostRow key={i} />;
                    return (
                      <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                        <td className="h-9 truncate pr-2 text-[13px] text-zinc-700 dark:text-zinc-300">
                          {state === "arriving"
                            ? sliceWords(row.description, ratioOf(rowSlotIndexOf(i)))
                            : row.description}
                        </td>
                        <td className="h-9 w-10 text-right font-mono text-[12px] tabular-nums text-zinc-400">
                          {state === "settled" ? row.quantity : ""}
                        </td>
                        <td className="h-9 w-24 text-right font-mono text-[12px] tabular-nums text-zinc-700 dark:text-zinc-300">
                          {/* Same rule as the money fields: the amount is the
                              row's last key, so until it is closed the row
                              shows a shimmer rather than a smaller number. */}
                          {state === "settled" ? (
                            formatMoney(row.amount, String(sample.fields.currency.value))
                          ) : (
                            <Shimmer className="ml-auto w-16" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {/* The row that might still be coming. Reserving it is the
                      difference between a table that grows and a table that
                      jumps. */}
                  {!done && <GhostRow />}
                </tbody>
              </table>

              {done && sample.warnings && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                  <strong className="font-medium">The object is valid and the arithmetic is not.</strong>{" "}
                  Every field parsed and every confidence is high — this one is only visible as a
                  check between fields, run once the stream ends.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
          Watch the <strong className="font-medium text-(--foreground)">Total</strong> row: rule, then
          shimmer, then the number — never a smaller number on its way to the real one. Text reveals
          under a caret because a half-typed name still reads as a name; money does not, because a
          half-arrived total is wrong rather than partial. Scripted at reading speed; there is no model
          behind this page.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One field                                                           */
/* ------------------------------------------------------------------ */

const BAND_STYLES = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-red-500",
} as const;

const BAND_LABELS = {
  high: "High confidence",
  medium: "Worth checking",
  low: "Probably wrong — check this",
} as const;

function band(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.85) return "high";
  return confidence >= 0.6 ? "medium" : "low";
}

function Field({
  spec,
  state,
  ratio,
  data,
  currency,
  correction,
  warning,
  onCorrect,
}: {
  spec: FieldSpec;
  state: FieldState;
  ratio: number;
  data: Extracted;
  currency: string | undefined;
  correction: string | undefined;
  warning?: string;
  onCorrect: (next: string | undefined) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const corrected = correction !== undefined;

  const full =
    spec.kind === "money" && typeof data.value === "number"
      ? formatMoney(data.value, currency)
      : String(data.value ?? "");

  const display = correction ?? (state === "arriving" ? sliceWords(full, ratio) : full);

  return (
    <div className={spec.half ? "" : "sm:col-span-2"}>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {spec.label}
        </span>
        {/* Confidence as a dot with a title rather than a number. The
            reader's question is "do I need to check this one?", and 0.31 does
            not answer it without them doing the mapping themselves. */}
        {state === "settled" && !corrected && (
          <span
            className={`h-1.5 w-1.5 rounded-full ${BAND_STYLES[band(data.confidence)]}`}
            title={`${BAND_LABELS[band(data.confidence)]} — ${Math.round(data.confidence * 100)}%`}
            aria-label={BAND_LABELS[band(data.confidence)]}
          />
        )}
        {corrected && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
            edited
          </span>
        )}
      </div>

      {/* Fixed height. This is what stops the form dancing as values land. */}
      <div className="mt-0.5 flex h-9 items-center">
        {editing ? (
          <input
            autoFocus
            defaultValue={display}
            onBlur={(event) => {
              setEditing(false);
              const next = event.target.value;
              onCorrect(next === full && !corrected ? undefined : next);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                event.currentTarget.value = display;
                event.currentTarget.blur();
              }
            }}
            className="h-8 w-full rounded-lg border border-zinc-300 bg-white px-2 text-[14px] outline-none dark:border-zinc-600 dark:bg-zinc-900"
          />
        ) : state === "empty" ? (
          /* Not a spinner. A spinner per field turns a form into a slot
             machine; a flat rule says "nothing here yet" and stays still. */
          <span className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" aria-hidden />
        ) : state === "arriving" && spec.kind === "money" ? (
          <Shimmer className="w-24" label={`${spec.label} still arriving`} />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            title={full}
            className="group flex h-9 w-full items-center gap-1.5 rounded-lg px-0.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <span
              className={`min-w-0 truncate text-[14px] ${
                warning ? "text-amber-700 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {display || <span className="text-zinc-400">—</span>}
            </span>
            {state === "arriving" && (
              <span className="inline-block h-[1.05em] w-[2px] shrink-0 animate-pulse bg-zinc-400 dark:bg-zinc-500" />
            )}
          </button>
        )}
      </div>

      {warning && (
        <p className="text-[11px] leading-4 text-amber-700 dark:text-amber-400">{warning}</p>
      )}

      {/* Where it came from. The reason this is worth the vertical space:
          checking a field against the document is otherwise a re-read of the
          whole document, and a reviewer who has to do that stops reviewing. */}
      {state === "settled" && !corrected && (
        <p
          className="truncate font-mono text-[10px] text-zinc-400 dark:text-zinc-500"
          title={data.evidence}
        >
          “{data.evidence}”
        </p>
      )}
    </div>
  );
}

function Shimmer({ className = "", label }: { className?: string; label?: string }) {
  return (
    <span
      className={`inline-block h-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 ${className}`}
      aria-label={label}
    />
  );
}

function GhostRow() {
  return (
    <tr className="border-t border-zinc-100 dark:border-zinc-800" aria-hidden>
      <td className="h-9">
        <span className="inline-block h-px w-16 bg-zinc-200 dark:bg-zinc-800" />
      </td>
      <td className="h-9" />
      <td className="h-9" />
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatMoney(amount: number, currency: string | undefined): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    /* An invalid currency code from a model is a routine event, not a crash. */
    return amount.toFixed(2);
  }
}

/** Reveal on word boundaries. Cutting mid-word makes text look corrupted
 *  rather than in-flight, which is the opposite of the impression wanted. */
function sliceWords(text: string, ratio: number): string {
  if (ratio >= 1) return text;
  const cut = Math.floor(text.length * ratio);
  const space = text.lastIndexOf(" ", cut);
  return text.slice(0, space > 0 ? space : cut);
}
