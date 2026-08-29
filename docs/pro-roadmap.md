# Pro roadmap

What Pro contains, what it should contain, and what the price does in between.

Ordered by what a buyer would miss most, not by what is quickest to build.

---

## Where it actually stands

| | Count |
| --- | --- |
| Pro templates | **11** (ai-chat, rag-qa, agent-console, structured-extraction, generative-ui, voice-assistant, answer-engine, memory-chat, support-copilot, image-studio, research-agent) |
| Pro components | **0** |
| Free components, published | **55** |

Eleven paid items, all templates. Every decision below follows from that sentence —
and the sentence has changed five times now, so re-read it before trusting anything
written under it.

The product boundary was recalibrated on 2026-08-29: `prompt-editor` and
`citation-popover` moved to Free. Their hard parts are local interface behavior.
The durable citation pipeline belongs to the RAG templates; prompt versioning,
evaluation and rollback would belong to a future Prompt Ops workflow rather
than behind an editor paywall.

The remaining four Pro components (`streaming-markdown`, `approval-gate`,
`cost-meter`, `edit-diff-view`) moved to Free the same day: the user decided the
paid story is templates, and a four-item component shelf was inventory, not value.
Pro is templates-only until a component's hard part clearly survives outside
every template.

### The thing to fix before charging anyone — **done**

`PRO_PLAN.features` in `src/lib/pro.ts` promised seven things, and one of them
was an empty category: Pro **blocks**. The blocks then shipped — and were
removed again within the day, for the better reason: they were *redundant*,
not empty. Every block was an extraction from a template the same buyer
already owns at the same price, so the layer added a second way to buy the
same code and a ninth nav tab to explain it with. Pro is templates and
components; that is the whole shape.

A customer who pays and finds half the list empty has not been oversold, they
have been shortchanged. Either the list shrinks to what is real, or the items
ship before checkout opens. The list shrinking is not a retreat — a short,
true list outsells a long one that a buyer can immediately catch out. The same
test, applied in the other direction, is what removed the blocks: a line that
adds no capability adds no line.

The same claim was hardcoded in two places that do not read `PRO_PLAN` — the
unlock dialog's summary line and, worst of all, the `/pro/success` receipt —
and both now say what the list says.

---

## Price

**Two tiers: $0 and Pro. Pro is everything — no paid-tier splitting.**

| | Free | Pro |
| --- | --- | --- |
| Price | $0, forever | **$49**, once |
| Components | All free ones, MIT | Free ones + every Pro one |
| Templates | — | All of them |
| Later additions | Free ones keep coming | Included, no extra cost |
| Licence | MIT — do anything | One dev, unlimited projects, commercial |

One paid tier, not three. A $49 / $99 / $199 ladder would mean deciding which
buyer gets the good version, and at this size that decision costs more in
hesitation at the pricing page than it could ever earn.

The original plan was a $29 launch price against a $49 standard price. The
reasoning still stands and is recorded here because a future offer would lean
on it:

**One-time and lifetime means early buyers are funding the work.** The low
price is what they get for buying while the Pro catalogue is still young.

**$49 is a decision, $99 is a justification.** A developer expenses $99 or
sleeps on it. What is scarce right now is not margin, it is *buyers* — the
first twenty people's feedback and testimonials are worth more than the price
difference on twenty sales.

**What actually shipped (2026-08-29): the launch promo was built, then hidden
before it ever ran.** The banner, countdown and strike-through price were
complete — `PromoBanner` at the top of every page, a `LaunchCountdown` beside
the Pro price, `$49` struck through beside `$29` on /pro and in the unlock
dialog, all gated on `LAUNCH_PROMO` in `src/lib/pro.ts` with a real deadline
(2026-09-04) and self-hiding past it. Two problems surfaced at the finish
line: the only Price that ever existed in Stripe was the $49 one, so the $29
the code advertised would have failed checkout's own price guard (503 by
design), and on reflection the urgency machinery was not the launch this
catalogue needed. The site sells at $49, once, with no promo UI.

The promo is not deleted — it is archived on branch **`promo-launch-price`**
(`0e83e70`), committed with each file's full in-progress state. Restoring it
means cherry-picking the promo parts (never merging the branch wholesale),
creating a matching one-time Price in Stripe first, and repointing
`STRIPE_PRICE_ID`. `PRO_PLAN` in `src/lib/pro.ts` remains the executable
source of truth for the charge.

There is no paid-tier ladder: Free stays Free and Pro contains the complete
paid catalogue. The Pro price can be revisited later without splitting the
entitlement or changing what existing buyers own.

Checkout now runs through the account, database and Stripe integration. The
pricing page exposes the purchase action only when all three are configured;
otherwise it shows an explicit setup state instead of a dead payment link.

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

### AI edit diff view — **shipped** as `edit-diff-view`

Accept and reject changes hunk by hunk.

*What breaks:* diffs that arrive *while streaming*, so hunk boundaries move
under the user's cursor. Plus the ordinary hard parts of any diff UI — word
level within line level, and partial acceptance leaving a coherent document.

*Shipped.* Without the host template after all — every trap listed above lives
in the data model, not the surrounding app. The answer is an append-only
segment list: `context` segments verbatim, `edit` segments with caller-given
ids, decisions keyed by id so an accept cannot slide onto a different hunk when
the stream re-splits. Incomplete hunks (`complete: false`) render their caret
with disabled buttons, and `buildMergedDocument` treats rejected and undecided
identically — both keep the original — so no state of the UI can leak half an
edit into the output.

### Citation source popover — **moved to Free** as `citation-popover`

Hover a claim, see the passage it came from.

*What breaks:* the anchor survives the round trip. It has to be attached
during retrieval, referenced through generation, and resolved back to a
character range in a document that may have been re-rendered since. Also the
positioning problem every popover has, plus touch, plus keyboard.

*Shipped, then moved to Free.* Promoted out of the RAG template rather than rewritten. Two things
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

### Prompt editor — **moved to Free** as `prompt-editor`

Variable highlighting, template preview, diffing between versions.

*What breaks:* less than the others. This is the honest low end of the list —
included because it is genuinely useful, not because it is hard. If the list
needs cutting, it goes first.

*Shipped, then moved to Free*, and the low-end call was right. The transparent-textarea-over-pre
trick is well known; the care went into the four places it silently fails —
typographic drift between the layers (one shared class constant), scroll sync,
the trailing newline that collapses in a pre, and unknown `{{variables}}`,
which get a warning tint and survive `renderTemplate` untouched rather than
vanishing into a silent hole.

---

## Order of work

The sequence:

1. ~~**Truthful feature list.**~~ Done.
2. ~~**Streaming Markdown renderer.**~~ Shipped.
3. ~~**RAG template.**~~ Shipped.
4. ~~**Citation popover.**~~ Shipped as `citation-popover`, promoted out of the
   RAG template, and later moved to Free.
5. ~~**Set the launch price.**~~ Done — **$49 once**. The $29 launch promo was
   built but pulled before going live; it is archived on branch
   `promo-launch-price` (see the Price section).

Everything above this line was the plan as written in the first draft. The
plan is now finished, which is the point at which a roadmap is most dangerous:
there is nothing left in it to disagree with.

### What is actually next

**Checkout.** The machinery is built and committed: the Stripe webhook issues
keys into Upstash, Resend delivers them, the success page shows the key
immediately, and every unconfigured piece degrades to something honest. What
remains is account setup, not code — a Payment Link, its webhook secret, the
Upstash pair, and a verified sending domain. Eleven Pro items and a price is
not a product until someone can pay, and someone is now four environment
variables away from being able to. This paragraph records the original launch
architecture; the current account checkout is defined by the Clerk, database
and Stripe configuration in the application.

**The final component work — shipped and recalibrated.** The AI edit diff view shipped
as `edit-diff-view`, without the host template the first draft argued for: the
four traps (hunks that re-split mid-stream, deciding on an incomplete hunk,
partial acceptance, word-level noise) all turned out to live in the segment
model, not in any surrounding app. Id-keyed decisions over an append-only
segment list, and the hard part stops being hard. The prompt editor also
shipped, then moved to Free: the original “honest low end” assessment was the
evidence that it did not belong behind the paid boundary.

**Blocks: shipped and removed, and both calls were right.** The category's
problem was never design — once the three were named (chat page shell,
document-reader split, agent console frame), extraction was a day's work. What
a day of looking at the finished pages showed is that the layer was
*duplicative*: Pro is one price for everything, so a block was the template's
own frame code sold back to the same buyer, distinguished only by having the
AI wiring stripped out. The extraction work was not wasted — it proved the
templates' frames are clean enough to lift — but the shelf it built is gone,
and the nav is back to eight tabs.

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
