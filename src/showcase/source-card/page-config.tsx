import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoCompact, DemoWithSnippet, DemoGrid } from "./demos";

export const sourceCardPageConfig: ComponentPageConfig = {
  sourceFile: "source-card.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Source list",
      note: "Numbered sources stacked vertically — the workhorse layout for research answers.",
      demo: <DemoDefault />,
    },
    {
      id: "compact",
      title: "Compact",
      note: "Title + domain only, no snippet. For tight spaces like a sidebar or footnote list.",
      demo: <DemoCompact />,
    },
    {
      id: "with-snippet",
      title: "With snippet",
      note: "A two-line snippet helps users judge relevance before clicking.",
      demo: <DemoWithSnippet />,
    },
    {
      id: "grid",
      title: "Grid",
      note: "For discovery-style layouts where multiple sources sit side by side.",
      demo: <DemoGrid />,
    },
  ],
  usage: [
    "Always show the domain — it's the fastest relevance signal, before the title or snippet.",
    "Number cards so the answer text can cite them with plain [1][2] markers.",
    "Open in a new tab with rel=\"noreferrer noopener\" — sources are third-party destinations.",
    "Keep snippets to two lines; truncate rather than expanding the card.",
    "Fall back to a colored letter avatar when a favicon isn't available — never a broken image icon.",
  ],
  mistakes: [
    "Hiding the source until hover — citations only work when the source is glanceable.",
    "Showing favicon-less broken images; always have a graceful fallback.",
    "Making the whole card a link that swallows the citation number as the anchor.",
    "Dropping the snippet in a full-screen modal instead of an inline card.",
  ],
};
