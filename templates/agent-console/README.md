# Agent run console — Scrim UI Template

Multi-step tool use you can watch, interrupt, approve, and re-run. The run
lives on the server, so it survives the tab that started it.

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
// lib/runner.ts
import { anthropic } from "@ai-sdk/anthropic";
// ...
model: anthropic("claude-sonnet-5"),
```

Try this first, to see the whole thing work:

> Find the open issues about streaming and comment on the most urgent one.

It searches (no approval), proposes a comment, and **stops**. Approve it and
the run continues on its own. Reload the page while it is waiting — the
timeline comes back exactly as it was.

## What is where

| Path | What it does |
| --- | --- |
| `lib/events.ts` | The event log and the reducer. **Read this first** — it is the seam everything else hangs off. |
| `lib/run-store.ts` | Where a run lives. Five functions to swap for a database. |
| `lib/runner.ts` | The step loop: one `streamText` call per step, and why. |
| `lib/tools.ts` | The tools, and `APPROVAL` — which of them need a person. |
| `lib/cost.ts` | Token and cost arithmetic that does not lie about cached input. |
| `app/api/runs/[id]/events/route.ts` | SSE with replay. The resume protocol is `Last-Event-ID`. |
| `app/api/runs/[id]/retry/route.ts` | Retry-after-failure and re-run-this-step, kept apart. |
| `components/use-run.ts` | Subscribe, fold, act. Holds no authority of its own. |
| `components/step-card.tsx` | One step. Collapsed unless it needs you. |
| `components/ui/*` | Scrim UI components — no dependencies, edit freely. |

## Four things worth knowing before you change it

**The run's state is not in React.** It is an append-only event log on the
server, and the client folds it into a view with `reduceRun`. That one choice
is what makes a reload, a second tab, and an approval from a different device
all work without a line of code for any of them. If you move state into a
component, you lose all three at once.

**Pausing for approval is a server concern.** `toolApproval: 'user-approval'`
makes the SDK emit an approval request *instead of* executing the tool. The run
then sits there — for minutes, if that is how long the person takes. The
decision comes back as an ordinary POST, gets appended to the conversation as a
`tool-approval-response`, and the next `streamText` call executes the tool or
tells the model it was refused.

**Set `TOOL_APPROVAL_SECRET` before a tool does anything real.** The
conversation is rebuilt from stored messages each turn; without a signature,
an "approved" flag is only a claim. With it, the SDK HMACs each approval to
its exact tool call and input, and a tampered one is rejected before the tool
runs.

**Cancel aborts the model, not the output.** `cancelRun` aborts the
`AbortController` the step was started with. The version that only flips a
status leaves the provider generating — billed in full, side effects intact.

## Re-run vs retry

Two different buttons on purpose:

- **Retry** — the run *failed*. The conversation is fine; take the step again.
- **Re-run from here** — the step *worked* and was wrong. The conversation is
  truncated to where that step began, or the model reads its own bad answer
  and repeats it.

The truncation is on `messages` only. The event log is appended to with a
`rewind` marker instead of being rewritten, because some other client is
halfway through replaying it.

## Making it yours

- **Real tools**: replace the `execute` bodies in `lib/tools.ts`. The return
  value is both what the model reads next and what the timeline renders, so
  keep it small and already formatted.
- **Which tools need approval**: `APPROVAL` in `lib/tools.ts`. The rule that
  survives contact with users — reads never, anything another person can see
  always, and never a gate people learn to click through without reading.
- **A real store**: `lib/run-store.ts` is a `Map` on the server module scope.
  It does not survive a restart and is not shared between instances. The file
  says exactly which five functions become SQL, and which one (cancellation)
  cannot.
- **Prices**: `lib/models.ts` carries USD per million tokens next to each
  model, because a model and its price go stale together. Check them against
  your provider before showing anyone a number.

## Licence

Covered by your Scrim UI Pro licence: one developer, unlimited projects,
including commercial and client work. Do not redistribute the source as a
component library or template of your own.
