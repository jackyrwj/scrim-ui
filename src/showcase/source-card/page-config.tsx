import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { sourceCardControls, renderSourceCard } from "./controls";

export const sourceCardPageConfig: ComponentPageConfig = {
  sourceFile: "source-card.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: sourceCardControls, render: renderSourceCard },
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
