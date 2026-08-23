# Icons come from Lucide, not from us

The site uses Lucide for every icon outside the copyable Components. We do not
draw an icon set of our own, and there is no `/icons` section.

We nearly did the opposite. An earlier version of this ADR had us drawing ~24
icons for AI Concepts — streaming, tool call, approval gate — on the reasoning
that general icon libraries do not cover them. **That reasoning was never
checked against the catalogue, and it was wrong.** Lucide ships 2034 icons, and
15 of the 24 already existed there under an obvious name: `text-cursor-input`,
`paperclip`, `message-square`, `message-square-warning`, `brain`, `gauge`,
`wrench`, `square-terminal`, `file-text`, `bot`, `shield-check`, `file-stack`,
`mic`, `audio-waveform`, `cpu`. Two of the drawings turned out to be Lucide's
own paths reproduced from memory — and the wrench was reproduced from an
outdated revision, so it was a worse copy of an icon we could have imported.

Only three concepts were genuinely missing — streaming, token, context-window —
which is not a set, and nowhere near enough to justify a nav tab, a licence, and
a maintenance burden.

The specification argument from the old ADR still holds and is why Lucide is the
right library rather than merely an acceptable one: we were already drawing to
its spec without deciding to, with 71 of 85 inline icons at `strokeWidth="2"`
and 79 of 88 at `fill="none"` on a 24×24 box. Adopting the library instead of
the spec gets the same visual fit with none of the drawing.

## Consequences

- `lucide-react` is a site dependency. It is in Next's default
  `optimizePackageImports`, so named imports tree-shake without config.
- **Copyable Components do not import it.** The dependency-free rule binds
  `src/showcase/<slug>/<slug>.tsx`, so those keep their inline SVG. The
  duplication there is deliberate and is not something this change fixes.
- `src/lib/icons.ts` maps Category and Component slugs to Lucide icons. That
  mapping — deciding *which* icon means *which* concept — is the part of the
  original idea worth keeping; the drawing was the waste.
- Icon names are checked against the installed package before being committed. A
  name recalled from memory is how the wrench happened.
