# RAG Document Q&A — Scrim UI Template

Upload a document, ask it questions, and get answers where every claim carries
a citation you can click — landing on the sentence it came from, highlighted in
the document beside it.

## Running it

```bash
npm install
cp .env.example .env.local   # add AI_GATEWAY_API_KEY
npm run dev
```

One [Vercel AI Gateway](https://vercel.com/ai-gateway) key reaches both the
answering models in `lib/models.ts` and the embedding model. To use a provider
directly instead, install its package and change those two lines. Nothing else
in the template changes.

## What is where

| Path | What it does |
| --- | --- |
| `lib/chunk.ts` | Chunking **with offsets**. The file the citations depend on. |
| `lib/retrieve.ts` | Top-k, the relevance floor, and the "I don't know" answer. |
| `lib/citations.ts` | Pulls `[2]` out of a stream that has not finished arriving. |
| `lib/store.ts` | The vector store. In memory — the one file to swap for a database. |
| `lib/parse.ts` | Bytes to text, normalised exactly once. PDF seam is here. |
| `app/api/ingest/route.ts` | Upload → parse → chunk → embed. Also re-chunks. |
| `app/api/ask/route.ts` | Retrieve, write the sources, then stream the answer. |
| `components/document-pane.tsx` | The document, with cited passages marked and scrolled to. |
| `components/answer.tsx` | The streaming answer, citations resolving as they arrive. |
| `components/ui/citation.tsx` | The chip and its popover — positioning, touch, keyboard. |

## The four things that make citations work

Most RAG demos print sources as a list of filenames at the bottom. That is the
easy 80% and the useless 80%. Getting from there to "click a claim, land on the
sentence" means not dropping the offsets at any of four points, and each one is
a place where the obvious code drops them.

**1. Chunking keeps offsets, not strings.** `text.split("\n\n").map(s =>
s.trim())` is unrecoverable — the moment a chunk is a detached string, all you
can say about it later is what it says, not where it was. So a chunk is a
`start` and an `end`, its text is a slice taken from them, and nothing
downstream ever trims. `verifyChunks` asserts it in development:

```ts
chunk.text === source.slice(chunk.start, chunk.end)
```

If that holds, a highlight cannot drift. If it stops holding, every citation is
off by however many characters you trimmed — a bug that looks like a rendering
problem for two days.

**2. Retrieval carries the offsets through.** `lib/retrieve.ts` returns
`start` and `end` alongside the score, and the numbering it assigns is the same
numbering the prompt uses and the same numbering the answer cites. Three places,
one source of truth.

**3. Sources reach the client before the first token.** `app/api/ask` writes
them as a data part and *then* streams the model in behind them, so a `[2]`
arriving in the third sentence resolves to a highlight immediately. Attaching
sources in `onFinish` — the common version — leaves every citation inert until
the answer completes, which is exactly when nobody needs them.

**4. The stream is parsed without flicker.** `[2]` arrives as `[`, `2`, `]`
across three frames. Parse each frame independently and the reader watches the
syntax flash through the text; buffer until the message finishes and you have
thrown away the streaming. `lib/citations.ts` withholds only the trailing
characters that might still become a marker — at most three, for one frame.

## The other thing worth knowing: it says "I don't know"

A vector search always returns its top k. Ask a document about quarterly revenue
what the weather is, and you get three chunks scoring 0.1 that the prompt then
presents as The Relevant Context — and the model, being agreeable, writes a
fluent, cited paragraph about nothing. That single failure is why people stop
trusting a RAG feature, and no amount of "only answer from the context" in a
system prompt fixes it.

So `RELEVANCE_FLOOR` in `lib/retrieve.ts` drops chunks that are not close
enough, and if that leaves nothing the route returns a fixed sentence without
calling the model at all. Tune the floor against your own corpus — the scores
are shown in the UI for exactly that reason.

## Making it yours

- **A real database.** Replace the five functions in `lib/store.ts`. With
  pgvector, `searchChunks` becomes `ORDER BY embedding <=> $1 LIMIT k` and the
  brute-force loop disappears into an index. **Keep the `start` and `end`
  columns** — they are the reason citations point at a sentence, and the first
  thing a schema copied from a tutorial leaves out.
- **PDFs.** `lib/parse.ts` has the seam, marked, and it is two lines plus an
  extractor. It is not bundled because a PDF extractor is a heavy dependency
  everyone would pay for whether or not they have a PDF. Note the `normalize`
  call in those two lines — skipping it is how offsets drift.
- **Follow-up questions.** Only the last message is retrieved against, so "and
  the quarter before?" retrieves badly. The fix is to rewrite the query against
  the conversation with a cheap model first; the seam is marked in
  `app/api/ask/route.ts` and everything downstream is unchanged.
- **Rendered Markdown in the reading pane.** The pane shows raw text on
  purpose: the offsets index into the characters that were measured, and
  rendering Markdown changes them — a heading loses its `##`, a link becomes
  its label, and every highlight after it lands early. Mapping offsets through
  a rendered tree is doable, and it is a different component.

## Limits, stated plainly

- **The store is a Map.** It does not survive a restart and is not shared
  between serverless instances. Deployed as-is, the honest description is
  "works until it does not". See `lib/store.ts`.
- **Ingestion runs on the request.** Fine for the 8MB cap in `lib/parse.ts`,
  wrong for a corpus. The phases the uploader shows are real; per-phase
  *progress* needs a job queue.
- **Re-chunking re-embeds.** That is a real API call, which is why Apply is a
  button and not a live slider.

## Licence

Covered by your Scrim UI Pro licence: one developer, unlimited projects,
including commercial and client work. Do not redistribute the source as a
component library or template of your own.
