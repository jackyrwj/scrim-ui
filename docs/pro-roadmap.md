# Pro roadmap

What Pro contains, what it should contain, and what the price does in between.

Ordered by what a buyer would miss most, not by what is quickest to build.

---

## Where it actually stands

| | Count |
| --- | --- |
| Pro templates | **5** (ai-chat, rag-qa, agent-console, structured-extraction, generative-ui) |
| Pro components | **4** (streaming-markdown, citation-popover, approval-gate, cost-meter) |
| Pro blocks | **0** |
| Free components, published | 38 |

Nine items. Every decision below follows from that sentence — and the sentence
has changed twice now, so re-read it before trusting anything written under it.

### The thing to fix before charging anyone — **done**

`PRO_PLAN.features` in `src/lib/pro.ts` promised seven things, and one of them
was an empty category: Pro **blocks**. There are still none.

A customer who pays and finds half the list empty has not been oversold, they
have been shortchanged. Either the list shrinks to what is real, or the items
ship before checkout opens. The list shrinking is not a retreat — a short,
true list outsells a long one that a buyer can immediately catch out.

So the blocks half of "Every Pro component and block, full source" is gone and
the components half stays, because the streaming Markdown renderer shipped
(see below) and the test is whether a category is empty, not whether it is
short. Six entries, all true today, and the licence did not change:
"everything added to Pro later, at no extra cost" already covers blocks for
anyone buying now, so the line goes back the day the first one ships and not
before.

The same claim was hardcoded in two places that do not read `PRO_PLAN` — the
unlock dialog's summary line and, worst of all, the `/pro/success` receipt —
and both now say what the list says.

---

## Price

**Two tiers: $0 and $99. Pro is everything — no feature splitting.**

| | Free | Pro |
| --- | --- | --- |
| Price | $0, forever | **$99**, once |
| Components | All free ones, MIT | Free ones + every Pro one |
| Templates | — | All of them |
| Later additions | Free ones keep coming | Included, no extra cost |
| Licence | MIT — do anything | One dev, unlimited projects, commercial |

One paid tier, not three. A $49 / $99 / $199 ladder would mean deciding which
buyer gets the good version, and at this size that decision costs more in
hesitation at the pricing page than it could ever earn.

The reasoning behind $49, so it survives being revisited:

**One-time and lifetime means early buyers are funding the work.** They pay for
a promise that has, right now, one piece of evidence behind it. The low price
is what they get for carrying that risk. Raising it later is easy and fair;
starting high and cutting is a betrayal of the people who believed first.

**$49 is a decision, $99 is a justification.** A developer expenses $99 or
sleeps on it. What is scarce right now is not margin, it is *buyers* — the
first twenty people's feedback and testimonials are worth more than the price
difference on twenty sales.

**A rising price is the only urgency that is not a lie.** No countdown timers,
no fake scarcity. But it works exactly once: `/pro` now tells buyers the price
will rise, so it has to actually rise, or the next announcement is worth
nothing.

| Price | Raise it when |
| --- | --- |
| ~~$49~~ | ~~1 template~~ |
| ~~$79~~ | ~~3 templates + the streaming Markdown renderer~~ — earned, never taken |
| **$99** | **Now** — 5 templates + the first batch of Pro components |
| ? | Nothing is promised above this. The next rung has to be earned before it is written down. |

The $79 rung passed without the price moving, so this is one raise rather than
two. That is the better outcome: `/pro` tells buyers the price rises as items
land, and the credibility of that sentence is worth more than the fifty
dollars a second announcement would have bought.

One thing this ladder cannot fix: there is still no checkout. `CHECKOUT_URL`
is empty and the button falls back to `/pro`. A price is a claim about a
transaction that does not exist yet, and until it does, every rung above is
theory.

### How the page stays honest

`FREE_PLAN` and `PRO_PLAN` in `src/lib/pro.ts` describe **scope** — "every Pro
template" is true on the day there is one and on the day there are ten.

What is in Pro *today* is **counted from the registry** when `/pro` renders,
never written by hand. So the page cannot promise a component that has not
shipped, and cannot forget one that has. Adding an item to the registry is the
only edit needed; the pricing page updates itself.

## What qualifies as Pro

The line, so it does not drift:

**Free** is anything a competent developer would finish in an afternoon.
Thirty-eight of those are published and they stay published — the search traffic
they earn is the only reason anyone arrives to see a price at all. Nothing
that is free today ever moves behind the lock.

**Pro** is the week you would lose to edge cases. Not bigger, not more —
*harder*. The test for every item below is a single question: **what breaks
when you write this yourself?** If the answer is "nothing much", it belongs in
the free tier.

Volume is the competition's story (shadcnblocks: 2,093 components, 1,726
blocks, $149). Trying to win on count against that is a losing race entered
three years late. The counter-position is depth: fewer things, each one
carrying decisions the buyer has not made yet.

---

## Templates

The flagship. A template is not "a bigger component" — it is the twenty
decisions *around* the components, which is the part that takes the week.

### 1. AI Chat — **shipped**

23 files, ~1,991 lines. Streaming, ordered message parts, tool calls,
reasoning, model switching with a server-side allowlist, conversation
persistence, and the error states a real deployment hits.

*The hard parts it already solves:* `parts` ordering, `stopWhen` (the reason
the assistant speaks after a tool call), the four `status` states, and
validating the model id server-side so a stranger cannot point your gateway
key at the most expensive model on offer.

### 2. RAG document Q&A — **shipped**

31 files, ~3,290 lines. Upload → chunk → embed → retrieve → answer **with
inline citations** that land on the sentence they came from.

*The hard part it solves:* the citations, and specifically the four places the
offsets get dropped. `lib/chunk.ts` holds the invariant — `chunk.text ===
source.slice(chunk.start, chunk.end)`, asserted in development — so a chunk is
a position rather than a detached string. `lib/retrieve.ts` carries the offsets
through with a numbering shared by the prompt and the answer.
`app/api/ask/route.ts` writes the sources as a data part *before* the first
token, so a `[2]` resolves the instant it arrives instead of after the stream
settles. And `lib/citations.ts` withholds the trailing characters that might
still become a marker, so `[`, `2`, `]` across three frames never flickers its
own syntax through the text.

*Also in it:* the relevance floor, which is the part that makes it
trustworthy — no chunk clears it, no model call, fixed "it is not in here".
Chunking strategy as a control rather than a constant, with the price of
re-embedding stated before the click. Parse states that are four real phases
rather than one spinner.

*Stated limits, in the README and in the code:* the store is a Map, ingestion
runs on the request, and PDF extraction is a marked two-line seam rather than
a bundled dependency.

*The original brief, kept because it is still the argument for the price:*
Almost every RAG demo prints sources as a list
at the bottom, which is the easy 80% and the useless 80%. What a reader
actually needs is to click a claim and land on the sentence it came from —
which means carrying chunk offsets through retrieval, into the prompt, back
out of a *streaming* response, and onto a highlight in a rendered document.
Nobody ships this because each link in that chain is where the offsets get
lost.

### 3. Agent run console — **shipped**

Multi-step tool use you can watch, interrupt, and approve.

*The hard part:* human-in-the-loop. Pausing an agent mid-run for approval
means the run has to be *resumable*, which means its state cannot live in a
React component. Add retry-after-failure and step-level re-run, and the state
machine is the entire product. This is where most agent UIs quietly give up
and just stream a log.

*Also in it:* a step timeline that stays readable at 40 steps, cost and token
accumulation per step, and cancellation that actually stops the model rather
than just hiding the output.

### 4. Structured extraction — **shipped**

Streaming structured output — a form that fills itself in, field by field, as
the model produces it.

*The hard part:* partial objects. A half-arrived object has fields that are
missing, half-typed, or about to be revised. Rendering that without flicker,
without layout shift, and without showing a number that is about to change is
a genuinely fiddly problem, and the naive version looks broken.

*Also in it:* schema-driven forms from zod, per-field confidence and
correction, and validation failure when the model returns something the schema
rejects.

### 5. Generative UI — **shipped**

The model returns components, not prose.

*The hard part:* the trust boundary. Model-chosen UI means the model chooses
what renders, so the registry of what it is *allowed* to render is the entire
security design. Get it wrong and you have handed prompt injection a rendering
engine.

*Also in it:* streaming component props, fallbacks when the model names a
component that does not exist, and interactive results that feed back into the
conversation.

---

## Pro components

Chosen because each one looks like an afternoon and is not. Not chosen to make
the list longer.

### Streaming Markdown renderer — **shipped**

*What breaks when you write it yourself:* everything is unfinished. A code
fence that has opened but not closed. A table missing its right border. A link
whose `](` has not arrived. A naive renderer flashes raw syntax on every
token, and the obvious fix — waiting for a complete block — destroys the
streaming feel you were trying to sell.

### AI edit diff view

Accept and reject changes hunk by hunk.

*What breaks:* diffs that arrive *while streaming*, so hunk boundaries move
under the user's cursor. Plus the ordinary hard parts of any diff UI — word
level within line level, and partial acceptance leaving a coherent document.

### Citation source popover — **shipped** as `citation-popover`

Hover a claim, see the passage it came from.

*What breaks:* the anchor survives the round trip. It has to be attached
during retrieval, referenced through generation, and resolved back to a
character range in a document that may have been re-rendered since. Also the
positioning problem every popover has, plus touch, plus keyboard.

*Shipped.* Promoted out of the RAG template rather than rewritten. Two things
were worth the care: `position: fixed` measured from the chip's rect, because
an absolutely-positioned panel inside a scrolling answer is clipped by it the
first time a citation lands near the bottom — and the **unresolved** state, a
number the model invented rendered as struck-through plain text. That last one
is the difference between a citation UI and a laundering machine: an empty
popover makes a hallucinated marker look exactly like a real one.

Note the free `citation-ui` next to it. That one is web-link citations with a
hover card — an afternoon, and it stays free. This one is passage citations
with offsets behind them. Same word, different problem.

### Human-in-the-loop approval card — **shipped** as `approval-gate`

The pause that asks "should I actually do this?"

*What breaks:* it is a *blocking* UI in a *streaming* transport. What happens
when the tab closes mid-approval? When the same run is open in two tabs? When
approval arrives after the request timed out?

*Shipped.* Not a promotion — the agent console's card is a card, and the three
questions above are not answerable by a card. The Pro component owns **no
decision**: `outcome` is a projection of the run's event log, `submitting` is
the only local state and means one thing (a request in flight from *this*
tab), and `request.id` is an idempotency key sent with the decision. Once the
outcome has a single source outside React, the closed tab and the second tab
stop being cases at all. The fifth state is the one nobody ships: a decision
recorded *after* the deadline, where a green tick would be a lie.

The free `approval-request` stays exactly where it is. It is the card, and the
card is genuinely an afternoon.

### Token and cost meter — **shipped** as `cost-meter`

Live spend, per message and per conversation.

*What breaks:* it is arithmetic on a moving target. Tokens are counted
differently per provider, cached input is priced differently from fresh, and
reasoning tokens are billed but often invisible. Being *approximately* right
here is worse than not showing it — a wrong cost figure is a support ticket.

*Shipped.* The arithmetic came out of `templates/agent-console/lib/cost.ts`;
the UI around it is new. Four traps, four answers: cached input subtracted from
`inputTokens` and priced apart (naive pricing over-bills a long conversation
by an order of magnitude), reasoning tokens displayed but never added (they are
already inside `outputTokens`), `undefined` kept as undefined rather than
collapsed to zero — with a visible `~` on any total built from an incomplete
record — and four decimals under a cent, because a meter that reads $0.00 six
turns running and then jumps to $0.01 has already lost the reader.

The rate table stays at the call site. A component that ships its own prices
is a component that is quietly wrong after the next provider announcement.

### Prompt editor

Variable highlighting, template preview, diffing between versions.

*What breaks:* less than the others. This is the honest low end of the list —
included because it is genuinely useful, not because it is hard. If the list
needs cutting, it goes first.

---

## Order of work

The sequence, given the price ladder:

1. ~~**Truthful feature list.**~~ Done.
2. ~~**Streaming Markdown renderer.**~~ Shipped.
3. ~~**RAG template.**~~ Shipped.
4. ~~**Citation popover.**~~ Shipped as `citation-popover`, promoted out of the
   RAG template.
5. ~~**Re-price.**~~ Done — **$99**, skipping the $79 rung, which had been
   earned and left on the table.

Everything above this line was the plan as written in the first draft. The
plan is now finished, which is the point at which a roadmap is most dangerous:
there is nothing left in it to disagree with.

### What is actually next

**Checkout.** `CHECKOUT_URL` is empty. Nine Pro items and a price is not a
product until someone can pay. This outranks every item below it and it is not
close.

**The two remaining Pro components.** The AI edit diff view is the last hard
one on the list — hunk boundaries that move under the cursor while the diff is
still streaming — and it has no host yet, which is an argument for building the
template that needs it first rather than the component in isolation. The prompt
editor was flagged in the first draft as the honest low end; that has not
changed, and it is still the first thing to cut.

**Blocks: still zero, and still unspecified.** No block has ever been named in
this document, which is why the category has stayed empty rather than late. A
block is a composed *section*, not a bigger component — a chat page shell, a
document-reader-plus-conversation split, an agent console frame. All three
already exist inside shipped templates, so this is extraction work rather than
design work. The feature-list line comes back the day the first one ships.

**Breadth is a separate argument, and it belongs to the free tier — first
round done.** The counter-position at the top of this document — depth over
count — is about *Pro*. Free components exist to earn the search traffic that
brings anyone to a pricing page at all, and the thin categories were the ones
to fill. Eight shipped:

- **Evaluation & Feedback**, a category that did not exist before this round:
  `response-rating`, `inline-correction`, `output-comparison`, `eval-results`.
  Every team building on models writes these by hand and none of the component
  libraries carry them. The arguments are in the files — a rating is a
  submission rather than a toggle; a correction is worthless without the
  original beside it; a comparison with visible model names measures reputation
  rather than output; a delta inside the noise floor is not a result.
- `source-list` (sources), `agent-plan` and `agent-handoff` (agents),
  `context-usage` (files).

Still thin after this round: `voice` and `memory`, both narrower surfaces than
they look. The next obvious free category is **safety and refusal** — a refusal
that names which policy and offers a next step, a moderation flag on a partial
stream, a confidence-qualified answer. Nobody ships those either, and every
product that gets big enough needs them.

**`/tools` is not in this document and should be.** Nine tool pages ship
today, none of them mentioned above. They are the highest-intent search surface
on the site and the natural shop window for the Pro components that do the same
job with real data — the token counter and the cost meter being the obvious
pair. Whoever picks this up next should write the tools section this document
is missing before adding a tenth.

Templates convert; components retain; tools are how people arrive. Someone
buys for the template they can picture themselves shipping, and stays because
the components keep saving them afternoons.
