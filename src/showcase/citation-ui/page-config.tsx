import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoInline, DemoBadge, DemoHoverCard, DemoSourceList } from "./demos";

export const citationUiPageConfig: ComponentPageConfig = {
  sourceFile: "citation-ui.tsx",
  heroDemo: <DemoInline />,
  variants: [
    {
      id: "inline",
      title: "Inline citation",
      note: "Numbered markers inline in prose. Hover (or focus) shows a preview card; the chip is still clickable as a link.",
      demo: <DemoInline />,
    },
    {
      id: "hover-card",
      title: "Hover card",
      note: "The preview card carries title, domain and snippet so users judge relevance without leaving the answer.",
      demo: <DemoHoverCard />,
    },
    {
      id: "source-list",
      title: "Source list",
      note: "The numbered reference list that pairs with the inline markers.",
      demo: <DemoSourceList />,
    },
    {
      id: "badge",
      title: "Markers + list",
      note: "Markers in text and the full list below — the canonical citation pattern.",
      demo: <DemoBadge />,
    },
  ],
  usage: [
    "Number sources in order of first citation so markers stay stable through the answer.",
    "Make the marker a real button/link — hover previews, click opens. Never a span with a title attribute.",
    "Keep hover cards above or below the text with enough offset they can't cover the next sentence.",
    "Provide the source list at the bottom — some users skip inline markers entirely.",
    "Keep snippets to two lines; the card should be glanceable, not a second article.",
  ],
  mistakes: [
    "Dropping markers into streaming text before the citation exists — cite only what's already grounded.",
    "Making the hover card dismiss on mouse-leave between text and card — bridge the gap with padding.",
    "Rendering citations as plain superscript numbers with no affordance that they're links.",
    "Reusing the same number for different sources across the answer — users will assume the error is theirs.",
  ],
};
