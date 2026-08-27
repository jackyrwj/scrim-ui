# Generative UI — Scrim UI Template

A Next.js chat where the model chooses which component to render. Weather
cards, flight pickers, charts, and a question the browser answers — plus the
part that matters more than any of them: a registry that decides what the
model is allowed to draw.

## Running it

```bash
npm install
cp .env.example .env.local   # add AI_GATEWAY_API_KEY
npm run dev
```

One [Vercel AI Gateway](https://vercel.com/ai-gateway) key reaches every model
in `lib/models.ts`. To use a provider directly instead, install its package and
change one line:

```ts
// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
// ...
model: openai("gpt-5.5"),
```

Nothing else changes.

## What is where

| Path | What it does |
| --- | --- |
| `lib/widgets.ts` | **The server registry.** What the model may call, and the schemas for it. No React. |
| `lib/tools.ts` | Turns the registry into a `ToolSet`. Adding a widget is one entry in `lib/widgets.ts`. |
| `components/widgets/registry.tsx` | **The client registry.** What the browser may draw — and the second validation. |
| `components/message.tsx` | Renders parts in model order; looks widgets up by name, never a `switch`. |
| `components/chat.tsx` | `useChat`, model switching, and the client-side tool round trip. |
| `app/api/chat/route.ts` | The endpoint. Model allowlist, tools, `stopWhen`, error mapping. |
| `components/ui/*` | Scrim UI components — no dependencies, edit freely. |

## The trust boundary

This is the whole security design, and it is worth reading before you add
anything.

**The registry is a closed set of names.** The model emits `showWeather`, not a
component, not a path, not JSX. A name that is not in `lib/widgets.ts` cannot
be called, and a name that is not in `components/widgets/registry.tsx` cannot
be drawn. Nothing in the pipeline turns model output into code.

**Props are validated twice.** The SDK validates tool input against the zod
schema on the server. The client validates the *output* again in
`renderWidget`, because message history is client-controlled input on every
turn — a crafted history is otherwise a way to hand a renderer props no model
ever produced. Zod is already in the bundle; the second parse costs
microseconds.

**No prop is a capability.** A widget takes a city name, not a URL to fetch; a
row id, not a callback; text, not HTML. The one place a URL appears it goes
through `safeUrl` in `lib/safe.ts`, which allows `http:` and `https:` and
nothing else — that check is what stops a `javascript:` href arriving as
"data".

**Unrecognised names degrade to prose.** A widget shipped this morning and a
tab open since yesterday, a lazy chunk that failed on a train, an old build
cached on a phone: in every case the model produced a usable answer and only
the renderer is missing. `components/message.tsx` renders the fallback with
the raw result behind a toggle. Throwing away a correct answer because the
client cannot draw it is the worst outcome available.

## Two more things worth knowing

**Skeletons take partial input.** `input-streaming` means the model has decided
*what* to show long before it has finished saying *about what*, so every
skeleton has to render with every field absent, at the size the real widget
will be. That is why the placeholders here are widget-shaped instead of
spinners — the alternative is a card that resizes under the reader's eyes.

**`askChoice` is a client-side tool.** It has no `execute`, so the SDK emits
the call and waits for the browser; the click becomes the tool output and
`sendAutomaticallyWhen` sends the conversation onward. That is a different
thing from a button that sends a message — the answer arrives attached to the
question the model asked, so two open questions cannot be confused.

## Adding a widget

1. Add a spec to `WIDGETS` in `lib/widgets.ts` — name, description, input and
   output schemas, `execute`. The tool appears automatically.
2. Write the component and its skeleton in `components/widgets/`.
3. Add one entry to `RENDERERS` in `components/widgets/registry.tsx`.

Miss step 3 and the widget degrades to prose rather than crashing, which is the
behaviour you want when a deploy is halfway out.

## Licence

Covered by your Scrim UI Pro licence: one developer, unlimited projects,
including commercial and client work. Do not redistribute the source as a
component library or template of your own.
