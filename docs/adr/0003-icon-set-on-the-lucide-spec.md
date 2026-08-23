# The icon set adopts the Lucide spec and ships under ISC

Our first Asset is an icon set for AI-interface Concepts — streaming, tool call,
approval gate, context window — drawn to Lucide's spec (24×24, 2px stroke, round
cap/join, `currentColor`, `fill: none`) and released under ISC carrying both our
copyright notice and Lucide's.

We were already drawing in that spec without having decided to: of the inline icons
across `src/showcase` and `src/components`, 71 of 85 use `strokeWidth="2"` and 79 of
88 use `fill="none"` on a 24×24 box. Adopting it formally means our icons drop into
any project already using Lucide and look native, which is most of our audience.
The alternative — a distinctive visual language — would differentiate the set
visually but fight every icon already in the reader's project, and contradict our
own 100 inline icons.

ISC follows from that choice rather than being independent. Icons are built by
composing and adapting Lucide primitives, which ISC permits for any purpose
"provided that the above copyright notice and this permission notice appear in all
copies". Since we must carry Lucide's notice anyway, matching their licence is the
simplest defensible position. This rules out CC0, which we cannot apply to work
containing ISC-derived material.

## Consequences

- **Scope is bounded by our own vocabulary.** An icon earns its place only by naming
  a Concept the site already has — a Category or a Component. This keeps the set
  impossible to replicate (it encodes our taxonomy), gives every icon a landing page
  to link from, and supplies a stopping rule so it never sprawls toward competing
  with Lucide's 1500.
- **One icon per Concept, never per Component.** Five message Components must not
  become five near-identical speech bubbles; a set whose silhouettes collide is a
  bad set. Expect roughly 24–28 icons from 10 Categories and 29 Components.
- **This is not a refactor.** Copyable Components stay dependency-free by rule, so
  the 100 inline duplicates remain. The value here is outward delivery only, and
  anyone hoping to dedupe the codebase with this will be disappointed.
