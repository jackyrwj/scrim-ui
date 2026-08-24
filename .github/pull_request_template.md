## What changed, and why

<!-- The diff says what. Say why: what was broken, or what the alternative
     was and why it lost. -->

## Checks

- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `node scripts/contrast.mjs` (if you touched `globals.css`)

## If this adds a component

- [ ] One file, importing nothing but React — the build fails otherwise
- [ ] Tailwind classes only, using the site's CSS variables; no hardcoded hex
- [ ] Dark mode works without a `dark:` on every line
- [ ] Keyboard reachable, no nested interactive elements
- [ ] Motion respects `prefers-reduced-motion`
- [ ] `usage` and `mistakes` written in `page-config.tsx`
