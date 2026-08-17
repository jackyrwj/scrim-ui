import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoError, DemoRetrying, DemoRateLimit } from "./demos";

export const errorMessagePageConfig: ComponentPageConfig = {
  sourceFile: "error-message.tsx",
  heroDemo: <DemoError />,
  variants: [
    {
      id: "error",
      title: "Error",
      note: "A red-tinted message with a one-line explanation and a single retry action. Click retry to see the success follow-up.",
      demo: <DemoError />,
    },
    {
      id: "retrying",
      title: "Retrying",
      note: "While the retry is in flight, the button becomes a spinner and the copy explains what is being preserved.",
      demo: <DemoRetrying />,
    },
    {
      id: "rate-limit",
      title: "Rate limit",
      note: "A countdown instead of a retry button — telling the user when they can act is more honest than a spinner that fails again.",
      demo: <DemoRateLimit />,
    },
  ],
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
