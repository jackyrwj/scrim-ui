import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoError } from "./demos";
import { errorMessageControls, renderErrorMessage } from "./controls";

export const errorMessagePageConfig: ComponentPageConfig = {
  sourceFile: "error-message.tsx",
  heroDemo: <DemoError />,
  explorer: { schema: errorMessageControls, render: renderErrorMessage },
  usage: [
    "Say what happened in one plain sentence and, if possible, what was preserved — a saved draft turns a failure into a small win.",
    "Offer exactly one recovery path. Error and retry, or rate-limit and wait — never both.",
    "Show a countdown for rate limits; a timer makes waiting feel finite and the user stops hammering retry.",
    "Keep errors inside the message thread so the conversation context survives the failure.",
  ],
  mistakes: [
    "A generic 'Something went wrong' with no hint of what to do next — the user has no lever.",
    "Auto-retrying on a loop without feedback; an invisible retry storm looks like a hang.",
    "Clearing the failed message or the composer on error, destroying the user's input.",
  ],
};
