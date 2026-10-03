# AICSS public component snapshot

These 54 files are the public React, Vue and Svelte source files recovered from
the AICSS registry on 2026-10-03. The Scrim UI site uses the React versions for
previews and serves each file as plain text from `/components/<slug>/source/`.

The public components appear within Scrim UI's existing Components categories.
Their source stays in this directory because their React styling uses CSS Modules
rather than Scrim UI's single-file Tailwind registry format. They are not added
to Scrim UI's `/r` registry. `FileDiff.tsx` has one `string` parameter annotation
to satisfy this project's TypeScript settings; its behavior is unchanged.

The five paid AICSS components (AI Agent Input, Approval Card, Audio Waves,
Image Processing, and To-do List) are not included. Their public registry
responses contain no source files; access requires the original project's token.
Independent React + Tailwind implementations of the same interface patterns
are in `src/recreated-components/` and are labeled accordingly on the site.
