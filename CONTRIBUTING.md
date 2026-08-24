# Contributing

## What this project is fussy about

One rule shapes almost everything here: **a component is a single file that
imports nothing but React.** No package, no version, no peer dependency, no
breaking change to absorb — you paste it and it is yours. That is the whole
promise, and it is why the registry can honestly declare `dependencies: []`.

It costs something. An icon is inline SVG rather than `lucide-react`. A
dropdown is written out rather than pulled from Radix. Some components are
longer than they would be with a library. That trade is deliberate; a pull
request that adds an import to a showcase component will fail the build, on
purpose — `src/app/r/[name]/route.ts` checks for it.

Everything else follows from the same idea:

- **Tailwind classes only**, using the site's CSS variables (`bg-(--card)`,
  `text-(--muted-foreground)`). No hardcoded hex, so dark mode is free.
- **Dark mode has to work** without a `dark:` variant on every line. If you
  reach for one, the token is probably wrong.
- **Keyboard and screen reader are not optional.** Real `<button>`s, no nested
  interactive elements, `aria-*` where the semantics are not carried by the
  tag. Contrast clears WCAG AA — `node scripts/contrast.mjs` checks the tokens.
- **Motion respects `prefers-reduced-motion`**, and pins to the animation's
  resting state rather than freezing on frame zero.
- **No hydration mismatch.** Anything derived from `Math.random()`, `Date.now()`
  or a full-precision float in an inline style will bite you. Round it.

## Adding a component

Six places, in this order:

1. **`src/lib/registry.ts`** — add a `ComponentEntry`: `name`, `slug`,
   `category` (an existing one), `description`, `frameworks`, `variants`,
   `tags`, `status: "published"`.
2. **`src/showcase/<slug>/<slug>.tsx`** — the component. One file, React only.
3. **`src/showcase/<slug>/demos.tsx`** — a rendered example per state worth
   showing.
4. **`src/showcase/<slug>/controls.tsx`** — the prop schema
   (`ComponentControls`) and a `render` function. This is what drives the
   explorer, and the generated snippet comes from it, so the code on the page
   and the component on the page cannot disagree.
5. **`src/showcase/<slug>/page-config.tsx`** — `sourceFile`, `heroDemo`,
   `explorer`, and the `usage` / `mistakes` lists. Write those two honestly:
   they are the part a reader cannot get from the source.
6. **Register it** in `src/showcase/registry.tsx` (`pageConfigs`),
   `src/components/site/component-preview.tsx` (the card tile), and
   `src/lib/icons.ts` (`componentIcons`).

The registry entry at `/r/<slug>.json`, the OG card and the sitemap entry are
all generated from step 1 — there is nothing to add for those.

## Adding to the resources directory

Entries in `src/lib/resources.ts` need a `notes` field: one line on **why we
list it**, not what it is. "Drop-in chat canvas with threads, streaming and
tools — good for production chat apps" is a reason. "A React component
library" is not. A listing without a reason is a link dump, and there are
enough of those.

Then run `npm run previews -- <slug>` to capture its screenshot.

## Arguing with the icon guide

`src/lib/icon-guide.ts` maps a concept to one Lucide icon. It is an opinion
and it is meant to be argued with — but bring the argument, not just a
preference. "`MessageSquareWarning` beats `TriangleAlert` for model errors
because the alert triangle already means system failure elsewhere in the same
interface" is an argument. Open an issue before a PR; if the mapping changes,
every component using that concept changes with it.

## Before you open a pull request

```bash
npx tsc --noEmit
npm run lint
node scripts/contrast.mjs     # if you touched globals.css
npm run build
```

All four have to pass. The build is the real check — it prerenders 253 routes
including every OG card and registry entry, and it is where a stray import in a
showcase component gets caught.

## What will not be merged

- A component that pulls in a dependency to save a few lines.
- A wrapper around someone else's library. Point at it from
  `src/lib/resources.ts` instead — that directory exists for exactly this.
- A component with no `usage` or `mistakes`. If there is nothing to say about
  when to use it, it is not documented, it is just posted.
- Copied code without a licence that permits it. Say where a pattern came from
  if you adapted one.

## Commits

Explain **why**, not what — the diff already says what. If you fixed
something, say what the broken behaviour actually was; if you chose one
approach over another, say what the other one was and why it lost. The history
here is written that way and it is worth keeping.
