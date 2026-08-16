import type { PatternPageConfig } from "@/lib/pattern-page";
import { ResearchAssistantPattern } from "./research-assistant";

export const researchAssistantPageConfig: PatternPageConfig = {
  sourceFile: "research-assistant.tsx",
  heroDemo: <ResearchAssistantPattern />,
  elements: [
    { label: "Search Tool Call", componentSlug: "search-tool-call" },
    { label: "Reasoning", componentSlug: "reasoning" },
    { label: "Citation UI", componentSlug: "citation-ui" },
    { label: "Source Card", componentSlug: "source-card" },
  ],
  usage: [
    "Show search and reasoning as they happen — research credibility comes from transparency.",
    "Keep sources persistent in a sidebar while the answer streams in the main column.",
    "Distinguish 'final answer' from intermediate reasoning visually.",
    "Let users verify any claim by clicking its citation.",
    "Collapse the search/tool trail once the answer lands so it doesn't dominate.",
  ],
  mistakes: [
    "Hiding the tool trail after answering — users can't audit how you got there.",
    "Answering before all searches complete, then revising confusingly.",
    "No way to see the full source, only a truncated snippet.",
    "Auto-scrolling the sources panel on every token, making it unreadable.",
  ],
};
