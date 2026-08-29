import type { PatternPageConfig } from "@/lib/pattern-page";
import { GenerativeDashboardPattern } from "./generative-dashboard";

export const generativeDashboardPageConfig: PatternPageConfig = {
  sourceFile: "generative-dashboard.tsx",
  heroDemo: <GenerativeDashboardPattern />,
  elements: [
    { label: "Generative UI", componentSlug: "generative-ui" },
    { label: "Tool Call", componentSlug: "tool-call" },
    { label: "Artifact Preview", componentSlug: "artifact-preview" },
    { label: "Error Message", componentSlug: "error-message" },
    { label: "Prompt Input", componentSlug: "prompt-input" },
  ],
  usage: [
    "Give the model a registry, not a canvas: metric card, bar chart, data table, report — every widget attributed to the tool call that made it.",
    "Stream props into a skeleton with the widget's final shape — the layout is known before the data, so nothing resizes on arrival.",
    "Degrade unsupported requests to prose plus the raw data — refused, not improvised.",
    "Treat widget interaction as conversation: clicking a bar sends the filter back into the chat as a message the model answers.",
    "Isolate widget failure to the widget — one card errors with its own Retry, the rest of the dashboard never blinks.",
  ],
  mistakes: [
    "Letting the model emit arbitrary markup — one hallucinated iframe and your dashboard is a security review.",
    "A spinner where the widget will be: the reader watches the card resize instead of watching data arrive.",
    "Silently swapping an unsupported request for a different chart — the user asked for a scatter and got a bar chart they'll misread.",
    "Widget clicks that mutate the canvas without entering the conversation — undoable, unauditable, invisible to the model.",
    "A render error in one widget tearing down the whole dashboard, or worse, the whole chat.",
  ],
};
