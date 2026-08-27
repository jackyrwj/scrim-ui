# Structured extraction — Scrim UI Template

A form that fills itself in, field by field, as the model produces it.
Streaming structured output, without the flicker.

## Running it

```bash
npm install
cp .env.example .env.local   # add AI_GATEWAY_API_KEY
npm run dev
```

Paste a document on the left, press Extract, and watch the form on the right.
Three samples are in the picker, chosen to fail in different ways: one clean,
one with a field that is genuinely absent, and one whose numbers do not add up
while satisfying every type in the schema.

## What is where

| Path | What it does |
| --- | --- |
| `lib/partial.ts` | **Read this first.** How to render a half-arrived object without lying. |
| `lib/schema.ts` | The zod schema, the form derived from it, and the checks the schema cannot make. |
| `app/api/extract/route.ts` | `streamText` + `Output.object`. Model allowlist and an input cap. |
| `components/field.tsx` | One field: empty → arriving → settled, at a fixed height. |
| `components/line-items.tsx` | The array, and the ghost row that keeps the table from jumping. |
| `components/extractor.tsx` | Wiring. Holds the document, the model, and local corrections. |

## The four things that make a streaming form look broken

**A partial number is a wrong number.** `12` on its way to `1234.56` renders
with total confidence for as long as the next four characters take to arrive,
and nobody reading a total of $12 forgives you at $1,234.56. Strings are
different — a half-typed name still reads as a name being typed. So strings
stream and numbers wait, which is the single highest-value rule in the
template.

**Knowing when a value is final is a schema decision, not a timing one.**
Every field here is `{ value, confidence, evidence }`. JSON streams in key
order, so `confidence !== undefined` *proves* `value` is closed — no debounce,
no "wait 200ms and hope". The general form: **put a cheap field after any field
you must not render half-finished.**

**Render the form before the data.** The fields come from
`Object.keys(invoiceSchema.shape)`, so every row exists — empty — from the
first frame. There is nothing to insert as values land, so nothing moves. The
fixed row height is the other half: a value that wraps to two lines when it
arrives pushes everything below it down.

**Schema-valid is not the same as right.** `findDiscrepancies` in
`lib/schema.ts` checks that the line items add up to the subtotal and that
subtotal + tax is the total. Both are things a model gets wrong while
satisfying every type. They surface as warnings, not errors — the numbers may
legitimately disagree, and blocking on it would be worse than pointing at it.

## Validation failure

`onFinish` hands back an error when the completed object does not satisfy the
schema, which happens often enough to design for: a number returned as
`"1,234.56"`, an enum outside the list. Instead of discarding the extraction,
the template re-parses to get the failing **paths** and names them, leaving
everything that did parse on screen and correctable by hand.

## Making it yours

- **A different document type**: change `invoiceSchema` and the `META` map
  beside it. The `Record<keyof …>` type means a new field will not compile
  until it has a label, so the form cannot silently drop one.
- **Where corrections go**: they are local state here on purpose — the right
  destination depends entirely on what you are extracting into. `corrections`
  in `components/extractor.tsx` is the one place to change.
- **Confidence you can trust**: the system prompt asks for it explicitly. A
  model that is not asked to express doubt will not, and every field comes
  back looking equally certain.
- **A file upload instead of a paste**: the route takes a string. Parsing PDFs
  into that string is its own problem and deliberately not this template's.

## Licence

Covered by your Scrim UI Pro licence: one developer, unlimited projects,
including commercial and client work. Do not redistribute the source as a
component library or template of your own.
