import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoLive } from "./demos";
import { searchToolCallControls, renderSearchToolCall } from "./controls";

export const searchToolCallPageConfig: ComponentPageConfig = {
  sourceFile: "search-tool-call.tsx",
  heroDemo: <DemoLive />,
  explorer: { schema: searchToolCallControls, render: renderSearchToolCall },
  usage: [
    "Show the query the moment the tool starts — users verify the search is about what they asked.",
    "Progress to results in place; collapsing and reopening the whole card is jarring.",
    "Always show result count — 'N sources' is a strong credibility signal.",
    "Make each result a real link that opens in a new tab with rel=\"noreferrer noopener\".",
    "Offer retry on failure; search backends fail often and users expect recovery.",
  ],
  mistakes: [
    "Hiding the query or the search entirely — users wonder where the answer came from.",
    "Auto-expanding every search with 20 full-width results, pushing the answer off screen.",
    "Never allowing cancellation of a long search.",
    "Presenting scraped snippets as facts without a link to the source.",
  ],
};
