# What the licence covers

The site says "free to copy" on every component page. Until now there was no
licence file, and no licence means all rights reserved — so the promise on the
page and the legal position of the repository disagreed. This is that promise
written down, and its limits.

## MIT — the code

`LICENSE` (MIT) covers the source in this repository: the components under
`src/showcase/`, the tools under `src/components/tools/`, and the site itself.

Copy a component into your project and you owe nothing — no attribution in your
UI, no link back, no notice to us. That is the entire point of the format: one
file, no dependency, yours once you paste it.

## Not covered

Three things in this repository are **not** MIT, because they are not code:

- **The editorial content.** The inspiration articles under `src/lib/inspiration.ts`,
  the "why we list it" notes and curation in `src/lib/resources.ts`, the usage
  and mistakes lists in each `page-config.tsx`, and the concept-to-icon mapping
  in `src/lib/icon-guide.ts`. Those are written judgements, not a library.
- **The name and the mark.** "Scrim UI" and the mark in
  `src/components/site/scrim-mark.tsx` identify this project. Fork the code
  freely; run it under your own name.
- **The screenshots in `public/previews/`.** Captures of third-party websites,
  included here to illustrate a directory listing. They belong to the sites
  they show.

## Third-party

- **Lucide** icons, ISC licence, © Lucide Contributors. The icons are theirs;
  the concept-to-icon mapping is ours. The full notice is on `/icons`.
- Every entry in the resources directory belongs to its own publisher. Listing
  something is not affiliation or endorsement, which the detail pages say too.
