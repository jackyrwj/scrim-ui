# AI Chat — Scrim UI Template

A complete Next.js chat application on the AI SDK. Streaming, tool calls,
reasoning, model switching, saved conversations, and the error states a real
deployment hits.

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
| `app/api/chat/route.ts` | The endpoint. Model allowlist, tools, `stopWhen`, error mapping. |
| `lib/models.ts` | The models the switcher offers — **and the server's allowlist**. |
| `lib/tools.ts` | Two example tools. Replace the bodies; the UI does not care. |
| `lib/storage.ts` | Conversation persistence. Four functions to swap for your API. |
| `components/chat.tsx` | Sidebar, transcript, composer. Reads `status` from `useChat`. |
| `components/message.tsx` | Renders one message part by part, in model order. |
| `components/ui/*` | Scrim UI components — no dependencies, edit freely. |

## Three things worth knowing before you change it

**`parts` is ordered.** A turn can be reasoning → tool call → text → another
tool call. Rendering "the text" and "the tools" as separate blocks silently
reorders what the model did. `components/message.tsx` maps over parts in
sequence for that reason.

**The model id is validated server-side.** It arrives in the request body from
a client you do not control. `isKnownModel` in `lib/models.ts` is what stops a
stranger pointing your gateway key at the most expensive model on offer. If you
add a model to the switcher, add it there — that is the allowlist.

**`stopWhen` is why the assistant speaks after a tool call.** Without it the
turn ends the moment the model calls a tool, and you get a tool result with no
sentence after it. It is the most common "my chatbot went silent" bug.

## Making it yours

- **Real tools**: replace the `execute` bodies in `lib/tools.ts`. The return
  value is both what the model reads next and what the UI renders, so keep it
  small and already formatted.
- **Server-side history**: replace the four mutators in `lib/storage.ts` with
  fetches. Every caller stays the same.
- **A different look**: the components in `components/ui/` are plain React and
  Tailwind with no dependencies. Edit them directly — there is no theme layer
  to fight.

## Licence

Covered by your Scrim UI Pro licence: one developer, unlimited projects,
including commercial and client work. Do not redistribute the source as a
component library or template of your own.
