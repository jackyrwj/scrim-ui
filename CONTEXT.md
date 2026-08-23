# AI UI Resources

A resource hub for people building AI product interfaces. It gives away four kinds
of thing — source you copy, interfaces you compose, tools you run, and writing you
read — all bounded to AI-native UI (see
[ADR 0001](./docs/adr/0001-ai-native-depth-over-breadth.md)).

## Language

### What we give away

**Component**:
A single AI-native interface element that **responds to interaction**, delivered as
source code the reader copies into their own project. Dependency-free by rule —
inline SVG and standard Tailwind classes only.
_Avoid_: Widget, element, snippet

**Pattern**:
A complete, remix-ready interface composed from several Components, e.g. a whole
chat or research flow rather than one control.
_Avoid_: Template, layout, example app

**Tool**:
A first-party utility that runs entirely in the reader's browser and produces
something — a mockup, a count, a diagram, an exported component.
_Avoid_: App, generator, utility

**Resource**:
A third-party thing we point at but do not host. Lives in the curated directory.
_Avoid_: Link, reference, listing

**Concept**:
One idea in the AI-interface vocabulary — streaming, tool call, approval gate,
context window. Sits above Component: several Components can express the same
Concept, and a Category is a grouping of Concepts. Useful when talking about what
the library covers, as distinct from how many files are in it.
_Avoid_: Topic, idea, tag

**Category**:
A named grouping of Concepts, used to organise the Components — prompt-input,
messages, reasoning, tool-calls, sources, agents, files, voice, memory,
model-settings. Ten of them, fixed.
_Avoid_: Section, group, collection

### Marks and brands

**Brand Mark**:
A third-party company's logo, rendered only to *identify* the product being named
or linked. Never a deliverable — we do not host, package or offer marks for
download, because their trademark rights are not covered by the CC0 license on the
path data. See [ADR 0002](./docs/adr/0002-no-third-party-marks-as-assets.md).
Distinct from the Lucide icons the site uses for its own concepts
([ADR 0003](./docs/adr/0003-lucide-for-icons.md)), which represent nobody.
_Avoid_: Logo, icon, brand icon

**Model Mark**:
The Brand Mark of the *provider* behind a named model — "Claude Opus 5" resolves to
Anthropic's mark. Resolved by leading token, not exact match.
_Avoid_: Model icon, provider logo
