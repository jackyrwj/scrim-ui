import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoMemoryToast } from "./demos";
import { memoryToastControls, renderMemoryToast } from "./controls";

export const memoryToastPageConfig: ComponentPageConfig = {
  sourceFile: "memory-toast.tsx",
  heroDemo: <DemoMemoryToast />,
  explorer: { schema: memoryToastControls, render: renderMemoryToast },
  usage: [
    "Put the saved fact in the toast — 'Memory updated' alone is a receipt with no items on it.",
    "Make Undo the primary action; the common reaction is 'that's wrong' or 'not in general', and one tap should make it never have happened.",
    "Keep Manage as a quiet text link for the rare audit, secondary to Undo.",
    "Render it as a notification that never steals focus or blocks the composer — timing and dismissal are the caller's decision.",
  ],
  mistakes: [
    "Announcing the event without the content, so the user still doesn't know what is now remembered about them.",
    "Opening the memory panel automatically on every save — the user was mid-conversation.",
    "No undo path at the moment of save; making the user dig through settings to reverse a thing the product did uninvited.",
  ],
};
