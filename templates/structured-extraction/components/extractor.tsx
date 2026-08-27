"use client";

import * as React from "react";
import { useObject } from "@ai-sdk/react";
import { DEFAULT_MODEL, MODELS } from "@/lib/models";
import { FIELDS, findDiscrepancies, invoiceSchema, type InvoiceField } from "@/lib/schema";
import { fieldState } from "@/lib/partial";
import { SAMPLES } from "@/lib/samples";
import { Field } from "./field";
import { LineItems, type PartialRow } from "./line-items";

/**
 * Document in, form out.
 *
 * The screen is two panes: what was pasted, and what came out of it. Side by
 * side rather than one after the other, because the job this is for is
 * *checking* — and checking means looking at both at once.
 *
 * Everything about how a partial value renders lives in lib/partial.ts and
 * the two components below. This one is wiring.
 */
export function Extractor() {
  const [document, setDocument] = React.useState(SAMPLES[0].text);
  const [model, setModel] = React.useState(DEFAULT_MODEL);
  /** Local edits, by field name. Never sent anywhere — see below. */
  const [corrections, setCorrections] = React.useState<Partial<Record<InvoiceField, string>>>({});
  const [invalid, setInvalid] = React.useState<string[]>([]);

  const { object, submit, isLoading, stop, error, clear } = useObject({
    api: "/api/extract",
    schema: invoiceSchema,
    onFinish: ({ error: schemaError }) => {
      if (!schemaError) {
        setInvalid([]);
        return;
      }
      /* The failure everyone forgets: the stream finished, and the object it
         produced does not satisfy the schema. It is not rare — a model asked
         for a number will occasionally hand back "1,234.56" as a string, and
         an enum will occasionally come back as a currency the list does not
         have. Re-parsing here gets the *paths* rather than one opaque
         message, so the form can point at the fields that failed instead of
         throwing the whole extraction away. */
      const parsed = invoiceSchema.safeParse(object);
      setInvalid(
        parsed.success ? [] : parsed.error.issues.map((issue) => issue.path.join(".")).filter(Boolean),
      );
    },
  });

  const done = !isLoading;

  function run() {
    /* Clear first. A second extraction rendering over the first one's values
       is the worst version of a stale read: every field looks settled and
       half of them belong to the previous document. */
    clear();
    setCorrections({});
    setInvalid([]);
    submit({ document, model });
  }

  const currency = object?.currency?.value;
  const discrepancies = React.useMemo(
    () => (object ? findDiscrepancies(object as Parameters<typeof findDiscrepancies>[0]) : []),
    [object],
  );
  const warningFor = (name: InvoiceField | "lineItems") =>
    discrepancies.find((d) => d.field === name)?.message;

  return (
    <div className="flex h-dvh flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h1 className="text-sm font-semibold tracking-tight">Structured extraction</h1>

        <select
          value={model}
          onChange={(event) => setModel(event.target.value)}
          className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-[13px] outline-none dark:border-zinc-800 dark:bg-zinc-900"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          onChange={(event) => {
            const sample = SAMPLES[Number(event.target.value)];
            if (sample) setDocument(sample.text);
          }}
          defaultValue="0"
          className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-[13px] outline-none dark:border-zinc-800 dark:bg-zinc-900"
        >
          {SAMPLES.map((sample, index) => (
            <option key={sample.name} value={index}>
              {sample.name} — {sample.hint}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          {isLoading && (
            <button
              type="button"
              onClick={() => stop()}
              className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={run}
            disabled={isLoading || document.trim().length === 0}
            className="inline-flex h-8 items-center rounded-lg bg-zinc-900 px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {isLoading ? "Extracting…" : "Extract"}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        {/* The document */}
        <div className="flex min-h-0 flex-col border-b border-zinc-200 lg:border-b-0 lg:border-r dark:border-zinc-800">
          <textarea
            value={document}
            onChange={(event) => setDocument(event.target.value)}
            spellCheck={false}
            placeholder="Paste an invoice…"
            className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-[12px] leading-5 outline-none placeholder:text-zinc-400"
          />
        </div>

        {/* The form */}
        <div className="min-h-0 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              Something went wrong. Try again, or switch models.
            </div>
          )}

          {invalid.length > 0 && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
              <p className="text-[13px] font-medium text-amber-800 dark:text-amber-400">
                The model returned something the schema rejects.
              </p>
              <p className="mt-1 text-[12px] leading-5 text-amber-700 dark:text-amber-500">
                Everything that did parse is shown below and can be corrected by hand. Failed:{" "}
                <span className="font-mono">{invalid.join(", ")}</span>
              </p>
            </div>
          )}

          {/* The form renders from the schema, so every row is here before
              any data is — which is why nothing moves as values arrive. */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {FIELDS.map((spec) => {
              const field = object?.[spec.name];
              return (
                <Field
                  key={spec.name}
                  spec={spec}
                  state={fieldState(field, done)}
                  value={field?.value}
                  confidence={field?.confidence}
                  evidence={field?.evidence}
                  currency={currency}
                  correction={corrections[spec.name]}
                  warning={warningFor(spec.name)}
                  onCorrect={(next) =>
                    setCorrections((current) => {
                      const updated = { ...current };
                      if (next === undefined) delete updated[spec.name];
                      else updated[spec.name] = next;
                      return updated;
                    })
                  }
                />
              );
            })}
          </div>

          <div className="mt-5">
            <LineItems
              rows={object?.lineItems as (PartialRow | undefined)[] | undefined}
              currency={currency}
              done={done}
              warning={warningFor("lineItems")}
            />
          </div>

          <p className="mt-5 text-[11px] leading-4 text-zinc-400 dark:text-zinc-500">
            Corrections are local to this page. Wiring them to a store is the one thing this template
            leaves to you — where they go depends entirely on what you are extracting into.
          </p>
        </div>
      </div>
    </div>
  );
}
